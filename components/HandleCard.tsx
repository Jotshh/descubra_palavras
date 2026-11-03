"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/supabase";

type P = { anonymous?: boolean; handle?: string; showInRanking?: boolean; nextChangeAt?: string | null };

export default function HandleCard() {
  const [p, setP] = useState<P | null>(null);
  const [h, setH] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => api<P>("/api/profile").then((x) => { setP(x); setH(x.handle ?? ""); }).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const save = async (body: { handle?: string; showInRanking?: boolean }) => {
    setMsg("");
    try { await api("/api/profile", body); await load(); setMsg("Salvo!"); } catch (e) { setMsg((e as Error).message); }
  };

  if (!p) return msg ? <p className="err">{msg}</p> : null;
  if (p.anonymous) {
    return (
      <section className="card">
        <span className="lbl">@ e ranking</span>
        <p className="ok">Você está jogando só com apelido. Entre com e-mail ou Google para ter um @, adicionar amigos e aparecer no ranking.</p>
      </section>
    );
  }
  return (
    <section className="card">
      <span className="lbl">@ e privacidade</span>
      <div className="acts">
        <input className="field" style={{ maxWidth: 260 }} value={h} maxLength={21} onChange={(e) => setH(e.target.value)} aria-label="Seu @" />
        <button className="btn" onClick={() => save({ handle: h })} disabled={h.replace(/^@/, "") === p.handle}>Salvar @</button>
      </div>
      {p.nextChangeAt && <p className="sync">Você poderá trocar o @ de novo em {new Date(p.nextChangeAt).toLocaleDateString("pt-BR")}.</p>}
      <label className="ok">
        <input type="checkbox" checked={!!p.showInRanking} onChange={(e) => save({ showInRanking: e.target.checked })} /> Aparecer no ranking geral
      </label>
      <span className="sync">Seu @ e seus resultados da palavra do dia ficam visíveis para todos no ranking só se você ativar essa opção.</span>
      {msg && <p className="ok" role="status">{msg}</p>}
    </section>
  );
}
