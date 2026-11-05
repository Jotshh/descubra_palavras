"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import HelpModal from "@/components/HelpModal";
import InviteBanner from "@/components/InviteBanner";
import { supabase } from "@/lib/supabase";
import { expired } from "@/lib/session";
import { useSession } from "@/lib/useSession";

export default function HomeClient() {
  const { session, ready } = useSession();
  const logged = ready && !!session && !expired(session);
  const [help, setHelp] = useState(false);
  useEffect(() => { if (logged) setHelp(true); }, [logged]); // abre toda vez que quem está logado abre o jogo

  return (
    <>
      <nav className="top">
        <span className="brand">TERMO COM MAETHOR E AMIGOS</span>
        {logged ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/amigos" className="ghost">Amigos</Link>
            <Link href="/ranking" className="ghost">Ranking</Link>
            <Link href="/perfil" className="ghost">Meu perfil</Link>
            <button className="ghost" onClick={() => setHelp(true)}>Como jogar</button>
            <button className="ghost" onClick={() => supabase().auth.signOut().then(() => (location.href = "/entrar"))}>Sair</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/como-jogar" className="ghost">Como jogar</Link>
            <Link href="/sobre" className="ghost">Sobre</Link>
            <Link href="/entrar" className="ghost">Entrar</Link>
          </div>
        )}
      </nav>
      <main className="wrap">
        {logged && <InviteBanner />}
        <section className="hero">
          <h1>Termo com Maethor<br />e amigos</h1>
          <p>Descubra a palavra secreta sozinho ou desafie os amigos. Seis tentativas, três cores de dica.</p>
          <div className="demo" aria-hidden="true">
            {["T", "E", "R", "M", "O"].map((l, i) => (
              <div key={i} className={`tile ${["demo-c", "demo-p", "demo-a", "demo-a", "demo-c"][i]}`}>{l}</div>
            ))}
          </div>
          {ready && !logged && <Link href="/entrar" className="btn pri" style={{ maxWidth: 280, margin: "24px auto 0" }}>Entrar para jogar</Link>}
        </section>
        <section className="modes">
          <article className="card">
            <h2>Palavra do dia</h2>
            <p>Uma palavra de 5 letras por dia, igual para todos. Seis tentativas e entrada no ranking.</p>
            <Link href="/diario" className="btn pri">Jogar a de hoje</Link>
          </article>
          <article className="card">
            <h2>Jogar solo</h2>
            <p>Uma palavra aleatória a cada partida, com 4, 5 ou 6 letras.</p>
            <Link href="/jogo" className="btn">Começar a jogar</Link>
          </article>
          <article className="card">
            <h2>Desafiar um amigo</h2>
            <p>Escolha uma palavra, gere um link e veja se o amigo descobre.</p>
            <Link href="/desafio/novo" className="btn">Criar desafio</Link>
          </article>
          <article className="card">
            <h2>Sala online</h2>
            <p>Entre numa sala com código e acompanhe o progresso de todos em tempo real.</p>
            <Link href="/sala" className="btn">Entrar ou criar sala</Link>
          </article>
        </section>
      </main>
      {help && <HelpModal onClose={() => setHelp(false)} />}
    </>
  );
}
