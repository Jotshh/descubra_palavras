"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/supabase";

/** Na sala de espera: convida amigos pelo @. O convite aparece para eles na home e em Amigos. */
export default function InviteFriends({ code }: { code: string }) {
  const [friends, setFriends] = useState<{ id: string; handle: string }[] | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => { api<{ friends: { id: string; handle: string }[] }>("/api/friends").then((r) => setFriends(r.friends)).catch(() => setFriends(null)); }, []);
  if (friends === null) return null; // conta anônima ou sem acesso: não mostra
  const invite = async (handle: string) => {
    setMsg("");
    try { await api("/api/invites", { roomCode: code, handle }); setSent((s) => ({ ...s, [handle]: true })); }
    catch (e) { setMsg((e as Error).message); }
  };
  return (
    <>
      <h2>Convidar amigos</h2>
      {friends.length === 0 && <p className="ok">Adicione amigos em “Amigos” para convidá-los aqui.</p>}
      <ul className="list">{friends.map((f) => (
        <li key={f.id}><span>@{f.handle}</span>
          <button className="ghost" disabled={sent[f.handle]} onClick={() => invite(f.handle)}>{sent[f.handle] ? "Convidado" : "Convidar"}</button></li>
      ))}</ul>
      {msg && <p className="err" role="alert">{msg}</p>}
    </>
  );
}
