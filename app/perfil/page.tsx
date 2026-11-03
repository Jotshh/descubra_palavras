"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HandleCard from "@/components/HandleCard";
import { loadLocal, sync } from "@/lib/history";
import { MODE_LABEL, Result, computeStats } from "@/lib/stats";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";

const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Perfil() {
  const { session } = useSession();
  const user = session?.user;
  const [list, setList] = useState<Result[]>([]);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    setList(loadLocal(user.id)); // aparece na hora, mesmo sem internet
    setStatus("Sincronizando…");
    sync(user.id).then((l) => { setList(l); setStatus("Sincronizado com a conta"); })
      .catch(() => setStatus("Salvo só neste aparelho por enquanto"));
  }, [user]);

  const st = useMemo(() => computeStats(list), [list]);
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const name = (meta.nickname || meta.name || user.email?.split("@")[0] || "Jogador") as string;
  const pct = st.games ? Math.round((100 * st.wins) / st.games) : 0;
  const maxDist = Math.max(1, ...st.dist);
  const since = new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const salvarApelido = async () => {
    if (nick.trim().length < 2) return setMsg("Use pelo menos 2 letras.");
    const { error } = await supabase().auth.updateUser({ data: { nickname: nick.trim() } });
    if (error) return setMsg(error.message);
    await supabase().auth.refreshSession();
    setEditing(false); setMsg("Apelido atualizado. Vale para as próximas salas e desafios.");
  };
  const compartilhar = async () => {
    const t = `TERMO COM MAETHOR E AMIGOS: ${name}\n${st.games} partidas, ${pct}% de vitórias, ${st.streak} dias seguidos, média de ${st.avg ? st.avg.toFixed(1) : "-"} tentativas`;
    try { await navigator.clipboard.writeText(t); setMsg("Estatísticas copiadas!"); } catch { setMsg("Não foi possível copiar."); }
  };

  return (
    <>
      <nav className="top">
        <Link href="/" className="brand">← Início</Link>
        <span className="sync">{status}</span>
      </nav>
      <main className="pf">
        <section className="card">
          <div className="pf-head">
            <div className="who">
              <div className="avatar" aria-hidden="true">{name[0]}</div>
              <div><h2>{name}</h2><p>Membro desde {since}</p></div>
            </div>
            <div className="chips">
              <div className="chip"><b>{st.games}</b><span>Partidas</span></div>
              <div className="chip"><b>{pct}%</b><span>Precisão</span></div>
              <div className="chip"><b>{st.streak}</b><span>Dias seguidos</span></div>
            </div>
          </div>
          <div className="acts">
            <button className="btn" onClick={() => { setNick(name); setEditing(!editing); }}>Editar apelido</button>
            <button className="btn pri" onClick={compartilhar}>Compartilhar estatísticas</button>
            <button className="btn" onClick={() => supabase().auth.signOut().then(() => (location.href = "/entrar"))}>Sair</button>
          </div>
          {editing && (
            <div className="acts">
              <input className="field" style={{ maxWidth: 260 }} value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} aria-label="Novo apelido" />
              <button className="btn pri" onClick={salvarApelido}>Salvar</button>
            </div>
          )}
          {msg && <p className="ok" role="status">{msg}</p>}
        </section>

        <HandleCard />

        <div className="grid3">
          <section className="card">
            <span className="lbl">Sequência diária</span>
            <div className="big">{st.streak} {st.streak === 1 ? "dia" : "dias"}</div>
            <div className="kv"><span>Melhor sequência</span><b>{st.best} {st.best === 1 ? "dia" : "dias"}</b></div>
          </section>
          <section className="card">
            <span className="lbl">Vitórias e ritmo</span>
            <div className="big">{st.wins} <small className="sync">/ {st.games} jogos</small></div>
            <div className="kv"><span>Aproveitamento</span><b>{pct}%</b></div>
            <div className="kv"><span>Média de tentativas</span><b>{st.avg ? st.avg.toFixed(1) : "-"}</b></div>
          </section>
          <section className="card">
            <span className="lbl">Modos de jogo</span>
            {(["daily", "solo", "challenge", "room"] as const).map((m) => (
              <div className="kv" key={m}><span>{MODE_LABEL[m]}</span><b>{st.modes[m].games}j ({st.modes[m].games ? Math.round((100 * st.modes[m].wins) / st.modes[m].games) : 0}% vit.)</b></div>
            ))}
          </section>
        </div>

        <div className="grid2">
          <section className="card">
            <span className="lbl">Distribuição de tentativas</span>
            {st.dist.map((n, i) => (
              <div className="bar-row" key={i}>
                <span>{i + 1}</span>
                <div className="bar-track"><div className={`bar-fill${n === maxDist && n > 0 ? " top" : ""}`} style={{ width: `${(n / maxDist) * 100}%` }}>{n || ""}</div></div>
                <span>{st.wins ? Math.round((100 * n) / st.wins) : 0}%</span>
              </div>
            ))}
            <span className="sync">Total de {st.wins} vitórias registradas</span>
          </section>
          <section className="card">
            <span className="lbl">Atividade nos últimos 90 dias</span>
            <div className="heat" role="img" aria-label={`${st.active} dias ativos nos últimos 90 dias`}>
              {st.heat.map((h) => <i key={h.key} title={`${h.key}: ${h.n} partidas`} className={h.n === 0 ? "" : h.n === 1 ? "h1" : h.n < 4 ? "h2" : "h3"} />)}
            </div>
            <span className="sync">{st.active} dias ativos no período</span>
          </section>
        </div>

        <section className="card">
          <span className="lbl">Conquistas ({st.achievements.filter((a) => a.done).length} de {st.achievements.length})</span>
          <div className="ach">
            {st.achievements.map((a) => (
              <div key={a.id} className={a.done ? "" : "lock"}>
                <b>{a.done ? "✓ " : ""}{a.title}</b>{a.desc}{!a.done && a.prog ? ` (${a.prog})` : ""}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <span className="lbl">Partidas recentes</span>
          {st.recent.length === 0 ? <p className="ok">Nenhuma partida ainda. Jogue uma para ver o histórico aqui.</p> : (
            <ul className="recent">
              {st.recent.map((r) => (
                <li key={r.id}>
                  <span><b>{r.word || "?"}</b> <small>{MODE_LABEL[r.mode]} · {r.len} letras · {fmt(r.at)}</small></span>
                  <span className="r">{r.won ? "Vitória" : "Derrota"} {r.attempts}/6</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
