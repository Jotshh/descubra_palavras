"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/supabase";

type Invite = { id: string; code: string; from: string; mode: string; len: number };

/** Mostra convites de sala recebidos de amigos (atualiza a cada 20 segundos). */
export default function InviteBanner() {
  const [list, setList] = useState<Invite[]>([]);
  const load = useCallback(() => api<{ invites: Invite[] }>("/api/invites").then((r) => setList(r.invites)).catch(() => {}), []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);
  if (!list.length) return null;
  const dismiss = (i: Invite) => api("/api/invites/dismiss", { id: i.id }).catch(() => {});
  return (
    <section style={{ display: "grid", gap: 10, margin: "8px 0" }} aria-live="polite">
      {list.map((i) => (
        <div className="card" key={i.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: 16 }}>
          <span><b>@{i.from}</b> convidou você para uma sala de {i.mode === "race" ? "corrida" : "duelo"} ({i.len} letras).</span>
          <span className="acts">
            <button className="ghost" onClick={async () => { await dismiss(i); location.href = `/sala/${i.code}`; }}>Entrar</button>
            <button className="ghost" onClick={async () => { await dismiss(i); load(); }}>Dispensar</button>
          </span>
        </div>
      ))}
    </section>
  );
}
