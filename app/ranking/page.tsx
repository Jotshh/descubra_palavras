"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";

type R = { handle: string; points: number; wins: number; games: number; attempts: number; secs: number; me: boolean };
type Scope = "day" | "week" | "all";
const TABS: [Scope, string][] = [["day", "Hoje"], ["week", "Semana"], ["all", "Geral"]];
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Ranking() {
  const { session } = useSession();
  const [scope, setScope] = useState<Scope>("day");
  const [rows, setRows] = useState<R[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setRows(null); setErr("");
    api<{ rows: R[] }>(`/api/ranking?scope=${scope}`).then((r) => setRows(r.rows)).catch((e) => setErr(e.message));
  }, [scope]);

  const anon = !!session?.user.is_anonymous;
  return (
    <main className="panel">
      <div className="card">
        <Link href="/" className="brand">← Início</Link>
        <h1>Ranking</h1>
        <div className="seg" role="group" aria-label="Período">
          {TABS.map(([k, label]) => <button key={k} aria-pressed={scope === k} onClick={() => setScope(k)}>{label}</button>)}
        </div>
        <p className="ok">
          {scope === "day" ? "Palavra do dia: menos tentativas e, no empate, menos tempo." : "Pontos da palavra do dia: 7 − tentativas por acerto."}
        </p>
        {err && <p className="err" role="alert">{err}</p>}
        {rows && rows.length === 0 && <p className="ok">Ninguém no ranking ainda. Jogue a palavra do dia e ative “aparecer no ranking geral” no perfil.</p>}
        {rows && rows.length > 0 && (
          <ol className="list">
            {rows.map((r, i) => (
              <li key={r.handle} style={r.me ? { outline: "2px solid var(--ink)" } : undefined}>
                <span>{i + 1}. @{r.handle}</span>
                <span>
                  {scope === "day"
                    ? (r.wins ? `${r.attempts}/6 · ${mmss(r.secs)}` : "Não acertou")
                    : `${r.points} pts · ${r.wins}/${r.games}`}
                </span>
              </li>
            ))}
          </ol>
        )}
        {anon && <p className="ok">Você está jogando só com apelido. Entre com e-mail ou Google para aparecer no ranking.</p>}
        <Link href="/diario" className="btn pri">Jogar a palavra do dia</Link>
        <Link href="/perfil" className="btn">Meu perfil e privacidade</Link>
      </div>
    </main>
  );
}
