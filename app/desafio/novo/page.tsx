"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useSession";

type Result = { name: string; status: string; attempts: number };

export default function NovoDesafio() {
  const { session } = useRequireLogin("/desafio/novo");
  const [word, setWord] = useState("");
  const [show, setShow] = useState(false);
  const [id, setId] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const link = id ? `${location.origin}/d/${id}` : "";

  const criar = async () => {
    setMsg(""); setBusy(true);
    try { setId((await api<{ id: string }>("/api/challenges", { word })).id); setResults(null); }
    catch (e) { setMsg((e as Error).message); }
    setBusy(false);
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(link); setMsg("Link copiado!"); } catch { setMsg("Não foi possível copiar."); }
  };
  const ver = async () => {
    try { setResults((await api<{ results: Result[] }>(`/api/challenges/${id}/results`)).results); }
    catch (e) { setMsg((e as Error).message); }
  };

  if (!session) return null;
  return (
    <main className="panel">
      <div className="card">
        <Link href="/" className="brand">← Início</Link>
        <h1>Desafiar um amigo</h1>
        {!id ? (
          <>
            <p>Digite a palavra secreta (4 a 6 letras). Ela precisa existir no dicionário.</p>
            <input className="field" type={show ? "text" : "password"} placeholder="Palavra secreta" value={word}
              maxLength={6} onChange={(e) => setWord(e.target.value)} autoComplete="off" />
            <label className="ok"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Mostrar palavra</label>
            <button className="btn pri" onClick={criar} disabled={busy || word.trim().length < 4}>Gerar link</button>
          </>
        ) : (
          <>
            <p>Mande este link para o amigo:</p>
            <input className="field" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
            <div className="row2">
              <button className="btn pri" onClick={copiar}>Copiar link</button>
              <button className="btn" onClick={ver}>Ver resultados</button>
            </div>
            {results && (results.length === 0 ? <p className="ok">Ninguém jogou ainda.</p> : (
              <ul className="list">
                {results.map((r, i) => (
                  <li key={i}><span>{r.name}</span><span>{r.status === "won" ? `Acertou em ${r.attempts}` : r.status === "lost" ? "Não acertou" : `Jogando (${r.attempts})`}</span></li>
                ))}
              </ul>
            ))}
            <button className="btn" onClick={() => { setId(""); setWord(""); setMsg(""); }}>Criar outro desafio</button>
          </>
        )}
        {msg && <p className="err" role="alert">{msg}</p>}
      </div>
    </main>
  );
}
