"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ServerGame, { Reply, Row } from "@/components/ServerGame";
import { recordGame } from "@/lib/history";
import { api } from "@/lib/supabase";

type Info = { day: string; rows: Row[]; status: string; word?: string; nextAt: string; now: number };
type Done = { won: boolean; attempts: number; word?: string };

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
};

export default function Diario() {
  const [info, setInfo] = useState<Info | null>(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [left, setLeft] = useState(0);
  const [msg, setMsg] = useState("");
  const grid = useRef<Row["res"][]>([]);

  useEffect(() => {
    api<Info>("/api/daily").then((i) => {
      grid.current = i.rows.map((r) => r.res);
      setInfo(i);
      if (i.status !== "playing") setDone({ won: i.status === "won", attempts: i.rows.length, word: i.word });
    }).catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!info || !done) return;
    const off = info.now - Date.now();
    const tick = () => setLeft(Math.max(0, Date.parse(info.nextAt) - (Date.now() + off)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [info, done]);

  const share = async () => {
    if (!info || !done) return;
    const m = { c: "■", p: "◆", a: "□" } as const;
    const t = `TERMO COM MAETHOR E AMIGOS · Palavra do dia ${info.day}\n${done.won ? done.attempts : "X"}/6\n` +
      grid.current.map((r) => r.map((x) => m[x]).join("")).join("\n");
    try { await navigator.clipboard.writeText(t); setMsg("Resultado copiado!"); } catch { setMsg("Não foi possível copiar."); }
  };

  if (err) return <main className="panel"><div className="card"><p className="err">{err}</p><Link href="/" className="btn">Voltar ao início</Link></div></main>;
  if (!info) return <main className="panel"><p className="ok">Carregando a palavra do dia…</p></main>;
  return (
    <>
      <nav className="top"><Link href="/" className="brand">← Palavra do dia · {info.day}</Link></nav>
      <ServerGame embedded len={5} rows={info.rows} status={info.status} word={info.word}
        onGuess={async (g) => { const r = await api<Reply>("/api/daily/guess", { guess: g }); grid.current.push(r.res); return r; }}
        onFinish={(r) => {
          setDone({ won: r.won, attempts: r.attempts, word: r.word });
          recordGame({ id: `daily:${info.day}`, mode: "daily", len: 5, won: r.won, attempts: r.attempts, word: r.word ?? "", secs: r.secs });
        }} />
      {done && (
        <div className="result">
          <h2>{done.won ? `Você acertou em ${done.attempts}!` : "Não foi dessa vez"}</h2>
          <p className="ok">A palavra era <b style={{ textTransform: "uppercase" }}>{done.word}</b>.</p>
          <p className="ok">Próxima palavra em <b>{clock(left)}</b></p>
          <div className="row2">
            <button className="btn pri" onClick={share}>Compartilhar resultado</button>
            <Link href="/ranking" className="btn">Ver ranking</Link>
          </div>
          {msg && <p className="ok" role="status">{msg}</p>}
        </div>
      )}
    </>
  );
}
