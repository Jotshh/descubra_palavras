"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";

type Item = { id: string; handle: string };
type Data = { me: string; friends: Item[]; incoming: Item[]; outgoing: Item[] };
type Invite = { id: string; code: string; from: string; mode: string; len: number };

export default function Amigos() {
  const { session } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await api<Data>("/api/friends"));
      setInvites((await api<{ invites: Invite[] }>("/api/invites")).invites);
    } catch (e) { setMsg((e as Error).message); }
  }, []);
  useEffect(() => { if (session && !session.user.is_anonymous) load(); }, [session, load]);

  const act = async (body: Record<string, string>) => {
    setMsg("");
    try { await api("/api/friends", body); if (body.action === "request") { setHandle(""); setMsg("Pedido enviado!"); } await load(); }
    catch (e) { setMsg((e as Error).message); }
  };
  const entrar = async (i: Invite) => {
    await api("/api/invites/dismiss", { id: i.id }).catch(() => {});
    location.href = `/sala/${i.code}`;
  };
  const dispensar = async (i: Invite) => { await api("/api/invites/dismiss", { id: i.id }).catch(() => {}); load(); };

  if (session?.user.is_anonymous) {
    return <main className="panel"><div className="card"><Link href="/" className="brand">← Início</Link><h1>Amigos</h1>
      <p className="ok">Você está jogando só com apelido. Entre com e-mail para ter um @ e adicionar amigos.</p></div></main>;
  }
  return (
    <main className="panel">
      <div className="card">
        <Link href="/" className="brand">← Início</Link>
        <h1>Amigos</h1>
        {data && <p className="ok">Seu @ é <b>@{data.me}</b>. Passe-o para os amigos adicionarem você.</p>}
        <div className="acts">
          <input className="field" style={{ flex: 1 }} placeholder="@ do amigo" value={handle} maxLength={21}
            onChange={(e) => setHandle(e.target.value)} aria-label="@ do amigo" />
          <button className="btn pri" disabled={handle.trim().length < 3} onClick={() => act({ action: "request", handle })}>Enviar pedido</button>
        </div>
        {msg && <p className="ok" role="status">{msg}</p>}

        {invites.length > 0 && (<>
          <span className="lbl">Convites para sala</span>
          <ul className="list">{invites.map((i) => (
            <li key={i.id}><span>@{i.from} · {i.mode === "race" ? "corrida" : "duelo"}, {i.len} letras</span>
              <span className="acts"><button className="ghost" onClick={() => entrar(i)}>Entrar</button><button className="ghost" onClick={() => dispensar(i)}>Dispensar</button></span></li>
          ))}</ul>
        </>)}

        {data && data.incoming.length > 0 && (<>
          <span className="lbl">Pedidos recebidos</span>
          <ul className="list">{data.incoming.map((f) => (
            <li key={f.id}><span>@{f.handle}</span>
              <span className="acts"><button className="ghost" onClick={() => act({ action: "accept", id: f.id })}>Aceitar</button><button className="ghost" onClick={() => act({ action: "decline", id: f.id })}>Recusar</button></span></li>
          ))}</ul>
        </>)}

        {data && data.outgoing.length > 0 && (<>
          <span className="lbl">Pedidos enviados</span>
          <ul className="list">{data.outgoing.map((f) => (
            <li key={f.id}><span>@{f.handle}</span><button className="ghost" onClick={() => act({ action: "cancel", id: f.id })}>Cancelar</button></li>
          ))}</ul>
        </>)}

        <span className="lbl">Meus amigos ({data?.friends.length ?? 0})</span>
        {data && data.friends.length === 0 && <p className="ok">Você ainda não tem amigos adicionados.</p>}
        <ul className="list">{data?.friends.map((f) => (
          <li key={f.id}><span>@{f.handle}</span>
            <button className="ghost" onClick={() => confirm(`Desfazer a amizade com @${f.handle}?`) && act({ action: "remove", id: f.id })}>Remover</button></li>
        ))}</ul>
        <Link href="/ranking" className="btn pri">Ver ranking entre amigos</Link>
      </div>
    </main>
  );
}
