import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { SITE_NAME } from "@/lib/site";

const description = "Conheça o projeto: um jogo de adivinhar palavras em português para jogar com amigos, com palavra do dia, desafios por link, salas online e ranking.";
export const metadata: Metadata = {
  title: "Sobre o jogo",
  description,
  alternates: { canonical: "/sobre" },
  robots: { index: true, follow: true },
  openGraph: { type: "article", url: "/sobre", title: `Sobre o jogo | ${SITE_NAME}`, description, siteName: SITE_NAME, locale: "pt_BR" },
};

export default function Sobre() {
  return (
    <PublicShell>
      <h1>Sobre o jogo</h1>
      <p>
        {SITE_NAME} é um jogo de adivinhar palavras em português, feito para jogar com os amigos. Dá para jogar sozinho, resolver a
        palavra do dia, desafiar alguém por link ou montar uma sala online e acompanhar o progresso de todos em tempo real.
      </p>

      <h2>O que você encontra</h2>
      <ul>
        <li>Palavras de 4, 5 e 6 letras, com dicionário em português que só aceita palavras existentes.</li>
        <li>Palavra do dia igual para todos, com ranking diário, semanal e geral.</li>
        <li>Desafios por link e salas de até 8 jogadores, em corrida ou duelo.</li>
        <li>Perfil com estatísticas, conquistas e mapa de atividade, além de amigos e ranking entre amigos.</li>
      </ul>

      <h2>Contas e privacidade</h2>
      <p>
        O jogo usa login com e-mail e senha. Aparecer no ranking geral é opcional e fica desligado por padrão. A palavra secreta nunca é
        enviada ao navegador enquanto você joga: quem avalia os palpites é o servidor. A medição de visitas usa uma ferramenta que não
        usa cookies.
      </p>

      <h2>Projeto independente</h2>
      <p>
        Este é um projeto independente, sem vínculo com outros jogos ou empresas. A mecânica de adivinhar uma palavra com dicas de cor
        é um formato de jogo conhecido, e todo o visual, o código e as regras específicas desta versão são próprios.
      </p>

      <h2>Créditos e tecnologia</h2>
      <p>
        A lista de palavras vem do projeto aberto <a href="https://github.com/fserb/pt-br" rel="noopener noreferrer">fserb/pt-br</a>, licenciado sob MIT.
        O site é feito com Next.js e TypeScript, usa Supabase para contas e partidas em tempo real e roda na Vercel.
      </p>
      <p><Link href="/como-jogar">Veja como jogar</Link> ou <Link href="/entrar" className="btn pri" style={{ maxWidth: 220, display: "inline-grid", padding: "0 20px" }}>Entrar e jogar</Link></p>
    </PublicShell>
  );
}
