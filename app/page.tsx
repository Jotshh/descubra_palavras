"use client";
import Link from "next/link";
import { useState } from "react";
import HelpModal from "@/components/HelpModal";

export default function Home() {
  const [help, setHelp] = useState(true); // abre toda vez que o jogo é aberto

  return (
    <>
      <nav className="top">
        <span className="brand">TERMO COM MAETHOR E AMIGOS</span>
        <button className="ghost" onClick={() => setHelp(true)}>Como jogar</button>
      </nav>
      <main className="wrap">
        <section className="hero">
          <h1>Termo com Maethor<br />e amigos</h1>
          <p>Descubra a palavra secreta sozinho ou desafie os amigos. Seis tentativas, três cores de dica.</p>
          <div className="demo" aria-hidden="true">
            {["T", "E", "R", "M", "O"].map((l, i) => (
              <div key={i} className={`tile ${["demo-c", "demo-p", "demo-a", "demo-a", "demo-c"][i]}`}>{l}</div>
            ))}
          </div>
        </section>
        <section className="modes">
          <article className="card">
            <h2>Jogar solo</h2>
            <p>Uma palavra aleatória a cada partida, com 4, 5 ou 6 letras.</p>
            <Link href="/jogo" className="btn pri">Começar a jogar</Link>
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
