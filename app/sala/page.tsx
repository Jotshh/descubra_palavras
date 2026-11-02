"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useSession";

export default function Sala() {
  const { session } = useRequireLogin("/sala");
  const [mode, setMode] = useState<"race" | "duel">("race");
  const [len, setLen] = useState(5);
  const [rounds, setRounds] = useState(3);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const criar = async () => {
    setBusy(true); setMsg("");
    try { const r = await api<{ code: string }>("/api/rooms", { mode, len, rounds }); location.href = `/sala/${r.code}`; }
    catch (e) { setMsg((e as Error).message); setBusy(false); }
  };

  if (!session) return null;
  return (
    <main className="panel">
      <div className="card">
        <Link href="/" className="brand">← Início</Link>
        <h1>Sala online</h1>
        <div className="seg" role="group" aria-label="Formato">
          <button aria-pressed={mode === "race"} onClick={() => setMode("race")}>Corrida</button>
          <button aria-pressed={mode === "duel"} onClick={() => setMode("duel")}>Duelo</button>
        </div>
        <p className="ok">{mode === "race" ? "Todos adivinham a mesma palavra. Vence quem acertar com menos tentativas." : "Cada jogador escolhe a palavra do próximo da roda."}</p>
        <div className="seg" role="group" aria-label="Tamanho da palavra">
          {[4, 5, 6].map((n) => <button key={n} aria-pressed={len === n} onClick={() => setLen(n)}>{n} letras</button>)}
        </div>
        <div className="seg" role="group" aria-label="Número de rodadas">
          {[1, 3, 5, 10].map((n) => <button key={n} aria-pressed={rounds === n} onClick={() => setRounds(n)}>{n} {n === 1 ? "rodada" : "rodadas"}</button>)}
        </div>
        <button className="btn pri" onClick={criar} disabled={busy}>Criar sala</button>
        <div className="sep">ou entre numa sala</div>
        <input className="field" placeholder="Código da sala" value={code} maxLength={5}
          onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <button className="btn" disabled={code.length < 5} onClick={() => (location.href = `/sala/${code}`)}>Entrar</button>
        {msg && <p className="err" role="alert">{msg}</p>}
      </div>
    </main>
  );
}
