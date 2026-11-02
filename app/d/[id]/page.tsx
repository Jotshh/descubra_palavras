"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ServerGame, { Reply, Row } from "@/components/ServerGame";
import { api } from "@/lib/supabase";
import { recordGame } from "@/lib/history";
import { useRequireLogin } from "@/lib/useSession";

type Info = { len: number; creator: string; rows: Row[]; status: string; word?: string };

export default function Desafio() {
  const { id } = useParams<{ id: string }>();
  const { session } = useRequireLogin(`/d/${id}`);
  const [info, setInfo] = useState<Info | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!session) return;
    api<Info>(`/api/challenges/${id}`).then(setInfo).catch((e) => setErr(e.message));
  }, [session, id]);

  if (err) return <main className="panel"><div className="card"><p className="err">{err}</p><Link href="/" className="btn">Voltar ao início</Link></div></main>;
  if (!info) return <main className="panel"><p className="ok">Carregando desafio…</p></main>;
  return (
    <ServerGame len={info.len} rows={info.rows} status={info.status} word={info.word} title={`Desafio de ${info.creator}`}
      onGuess={(guess) => api<Reply>(`/api/challenges/${id}/guess`, { guess })}
      onFinish={(r) => recordGame({ id: `challenge:${id}`, mode: "challenge", len: info.len, won: r.won, attempts: r.attempts, word: r.word ?? "", secs: r.secs })} />
  );
}
