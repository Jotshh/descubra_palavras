"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ServerGame, { Reply, Row } from "@/components/ServerGame";
import { api, supabase } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useSession";

type P = { id: string; nickname: string; seat: number; status: string; patterns: string[]; score: number; hasWord: boolean };
type S = {
  room: { code: string; host: string; mode: "race" | "duel"; len: number; status: string; round: number; roundEndsAt: string | null };
  players: P[]; joined: boolean; me: { id: string; rows: Row[]; setFor: string | null };
  words?: { nickname: string; word: string }[]; now: number;
};

const Mini = ({ patterns }: { patterns: string[] }) => (
  <div className="mini" aria-hidden="true">
    {patterns.map((pt, i) => <div key={i}>{[...pt].map((c, j) => <span key={j} className={`sq ${c}`} />)}</div>)}
  </div>
);
const label = (p: P) => p.status === "won" ? `Acertou em ${p.patterns.length}` : p.status === "lost" ? "Não acertou" : p.status === "playing" ? "Jogando" : "Aguardando";

export default function Sala() {
  const { code: raw } = useParams<{ code: string }>();
  const code = raw.toUpperCase();
  const { session } = useRequireLogin(`/sala/${code}`);
  const [s, setS] = useState<S | null>(null);
  const [offset, setOffset] = useState(0);
  const [left, setLeft] = useState(0);
  const [word, setWord] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      let r = await api<S>(`/api/rooms/${code}`);
      if (!r.joined && r.room.status === "lobby") { await api(`/api/rooms/${code}/join`, {}); r = await api<S>(`/api/rooms/${code}`); }
      setS(r); setOffset(r.now - Date.now());
    } catch (e) { setErr((e as Error).message); }
  }, [code]);

  useEffect(() => {
    if (!session) return;
    load();
    const ch = supabase().channel(`room-${code}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_code=eq.${code}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `code=eq.${code}` }, load)
      .subscribe();
    const poll = setInterval(load, 5000); // reserva, caso o Realtime não esteja ligado
    return () => { supabase().removeChannel(ch); clearInterval(poll); };
  }, [session, code, load]);

  const ends = s?.room.roundEndsAt ? new Date(s.room.roundEndsAt).getTime() : 0;
  const playing = s?.room.status === "playing";
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setLeft(Math.max(0, ends - (Date.now() + offset))), 500);
    const k = setTimeout(() => api(`/api/rooms/${code}/tick`, {}).then(load).catch(() => {}), Math.max(0, ends - (Date.now() + offset)) + 400);
    return () => { clearInterval(t); clearTimeout(k); };
  }, [playing, ends, offset, code, load]);

  const act = async (path: string, body: unknown = {}) => {
    setMsg("");
    try { await api(`/api/rooms/${code}/${path}`, body); await load(); } catch (e) { setMsg((e as Error).message); }
  };
  const copiar = async () => { try { await navigator.clipboard.writeText(`${location.origin}/sala/${code}`); setMsg("Link copiado!"); } catch { setMsg("Não foi possível copiar."); } };

  if (err) return <main className="panel"><div className="card"><p className="err">{err}</p><Link href="/sala" className="btn">Voltar</Link></div></main>;
  if (!s) return <main className="panel"><p className="ok">Entrando na sala…</p></main>;

  const { room, players, me } = s;
  const isHost = room.host === me.id;
  const mine = players.find((p) => p.id === me.id);
  const mm = String(Math.floor(left / 60000)).padStart(1, "0") + ":" + String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  const modeName = room.mode === "race" ? "Corrida" : "Duelo";

  const roster = (
    <ul className="list">
      {players.map((p) => <li key={p.id}><span>{p.nickname}{p.id === room.host ? " (criador)" : ""}</span><span>{p.score} pts</span></li>)}
    </ul>
  );

  return (
    <>
      <nav className="top">
        <Link href="/" className="brand">← Sala {code}</Link>
        <span className="ok">{modeName} · {room.len} letras · rodada {Math.max(room.round, 1)}</span>
      </nav>

      {room.status === "lobby" && (
        <main className="panel"><div className="card">
          <p className="ok">Código da sala</p>
          <div className="code">{code}</div>
          <button className="btn" onClick={copiar}>Copiar link da sala</button>
          <h2>Jogadores ({players.length}/8)</h2>
          {roster}
          {isHost
            ? <button className="btn pri" disabled={players.length < 2} onClick={() => act("start")}>{room.mode === "duel" ? "Escolher palavras" : "Iniciar rodada"}</button>
            : <p className="ok">Aguardando o criador iniciar.</p>}
          {msg && <p className="err" role="alert">{msg}</p>}
        </div></main>
      )}

      {room.status === "words" && (
        <main className="panel"><div className="card">
          <h2>Escolha a palavra</h2>
          {mine?.hasWord ? <p className="ok">Palavra enviada. Aguardando os outros.</p> : (
            <>
              <p className="ok">Palavra de {room.len} letras para <b>{me.setFor}</b> adivinhar.</p>
              <input className="field" type="password" value={word} maxLength={room.len} autoComplete="off" placeholder="Palavra secreta" onChange={(e) => setWord(e.target.value)} />
              <button className="btn pri" disabled={word.trim().length !== room.len} onClick={async () => { await act("word", { word }); setWord(""); }}>Enviar palavra</button>
            </>
          )}
          <ul className="list">{players.map((p) => <li key={p.id}><span>{p.nickname}</span><span>{p.hasWord ? "Pronto" : "Escolhendo…"}</span></li>)}</ul>
          {isHost && <button className="btn pri" disabled={players.some((p) => !p.hasWord)} onClick={() => act("start")}>Começar rodada</button>}
          {msg && <p className="err" role="alert">{msg}</p>}
        </div></main>
      )}

      {room.status === "playing" && mine && (
        <div className="room">
          <div>
            <div className="timer" aria-label="Tempo restante">{mm}</div>
            <ServerGame key={room.round} embedded len={room.len} rows={me.rows} status={mine.status} word={undefined}
              onGuess={(guess) => api<Reply>(`/api/rooms/${code}/guess`, { guess })} />
            {mine.status !== "playing" && <p className="ok" style={{ textAlign: "center" }}>{label(mine)}. Aguardando os outros jogadores…</p>}
          </div>
          <aside className="side">
            {players.filter((p) => p.id !== me.id).map((p) => (
              <div className="pcard" key={p.id}>
                <div className="head"><span>{p.nickname}</span><small>{label(p)}</small></div>
                <Mini patterns={p.patterns} />
              </div>
            ))}
          </aside>
        </div>
      )}

      {room.status !== "lobby" && !mine && (
        <main className="panel"><div className="card"><p className="ok">Esta sala já começou e você não está nela.</p><Link href="/sala" className="btn">Voltar</Link></div></main>
      )}

      {room.status === "finished" && (
        <main className="panel"><div className="card">
          <h2>Fim da rodada {room.round}</h2>
          {s.words && <p className="ok">{room.mode === "race" ? "A palavra era" : "Palavras"}: {room.mode === "race" ? <b style={{ textTransform: "uppercase" }}>{s.words[0]?.word}</b> : s.words.map((w) => `${w.nickname}: ${w.word.toUpperCase()}`).join(" · ")}</p>}
          <ol className="list rank">
            {[...players].sort((a, b) => b.score - a.score).map((p) => (
              <li key={p.id}><span>{p.nickname}</span><span>{label(p)}</span><span>{p.score} pts</span></li>
            ))}
          </ol>
          {isHost ? <button className="btn pri" onClick={() => act("start")}>{room.mode === "duel" ? "Próxima rodada (escolher palavras)" : "Próxima rodada"}</button> : <p className="ok">Aguardando o criador iniciar a próxima rodada.</p>}
          {msg && <p className="err" role="alert">{msg}</p>}
        </div></main>
      )}
    </>
  );
}
