import type { Metadata } from "next";
import Link from "next/link";
import HomeClient from "@/components/HomeClient";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "/", title: SITE_TITLE, description: SITE_DESCRIPTION, siteName: SITE_NAME, locale: "pt_BR" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, url: SITE_URL, name: SITE_NAME, inLanguage: "pt-BR", description: SITE_DESCRIPTION },
    {
      "@type": "WebApplication", "@id": `${SITE_URL}/#app`, name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION,
      inLanguage: "pt-BR", applicationCategory: "GameApplication", genre: "Jogo de palavras", operatingSystem: "Web (qualquer navegador)",
      isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      featureList: ["Modo solo com palavras de 4, 5 e 6 letras", "Palavra do dia igual para todos", "Desafios por link", "Salas online com até 8 jogadores", "Ranking e amigos"],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient />
      <section className="wrap prose" aria-labelledby="sobre-jogo">
        <h2 id="sobre-jogo">Um jogo de palavras em português para jogar com os amigos</h2>
        <p>
          {SITE_NAME} é um jogo de adivinhar palavras direto no navegador, sem instalar nada. Você tem seis tentativas para
          descobrir a palavra secreta, e cada palpite recebe dicas de cor: a letra certa no lugar certo, a letra certa no lugar errado
          ou uma letra que não existe na palavra.
        </p>
        <h2>Modos de jogo</h2>
        <ul>
          <li><b>Palavra do dia:</b> uma palavra de 5 letras por dia, igual para todos, com ranking por dia, semana e geral.</li>
          <li><b>Solo:</b> palavras aleatórias de 4, 5 ou 6 letras, quantas partidas você quiser.</li>
          <li><b>Desafio por link:</b> escolha uma palavra, mande o link e veja em quantas tentativas o amigo acerta.</li>
          <li><b>Sala online:</b> até 8 jogadores em corrida (mesma palavra para todos) ou duelo, com placar por rodadas.</li>
        </ul>
        <h2>Perguntas frequentes</h2>
        <h3>É grátis?</h3>
        <p>Sim. O jogo é gratuito e funciona no computador e no celular.</p>
        <h3>Precisa de conta?</h3>
        <p>Sim, uma conta com e-mail e senha. Ela guarda suas estatísticas e permite jogar em salas e desafios com amigos.</p>
        <h3>Acentos contam?</h3>
        <p>Não. “Ação” vale como “acao”, e o cedilha também é ignorado.</p>
        <p><Link href="/como-jogar">Veja as regras completas</Link> ou <Link href="/sobre">saiba mais sobre o projeto</Link>.</p>
      </section>
      <footer className="foot">
        <span>{SITE_NAME}. Projeto independente de jogo de palavras.</span>
        <span style={{ display: "flex", gap: 16 }}><Link href="/como-jogar">Como jogar</Link><Link href="/sobre">Sobre</Link></span>
      </footer>
    </>
  );
}
