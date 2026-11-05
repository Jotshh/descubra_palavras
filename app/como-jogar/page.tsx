import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { SITE_NAME } from "@/lib/site";

const description = "Aprenda a jogar: seis tentativas para descobrir a palavra secreta, o significado das cores das dicas e todos os modos, do solo às salas online com amigos.";
export const metadata: Metadata = {
  title: "Como jogar",
  description,
  alternates: { canonical: "/como-jogar" },
  robots: { index: true, follow: true },
  openGraph: { type: "article", url: "/como-jogar", title: `Como jogar | ${SITE_NAME}`, description, siteName: SITE_NAME, locale: "pt_BR" },
};

const Ex = ({ cls, letter, children }: { cls: string; letter: string; children: React.ReactNode }) => (
  <div className="ex"><div className={`tile ${cls}`}>{letter}</div><p>{children}</p></div>
);

export default function ComoJogar() {
  return (
    <PublicShell>
      <h1>Como jogar</h1>
      <p>Descubra a palavra secreta em até seis tentativas. Depois de cada palpite, as letras mudam de cor para mostrar o quanto você chegou perto.</p>

      <h2>Regras</h2>
      <ol>
        <li>Escolha o tamanho da palavra: 4, 5 ou 6 letras (a palavra do dia tem sempre 5).</li>
        <li>Digite um palpite e aperte Enter. Ele precisa ser uma palavra que exista no dicionário.</li>
        <li>Use as cores para ajustar o próximo palpite.</li>
        <li>Acertou antes da sexta tentativa? Você venceu. Acentos e cedilha são ignorados: “ação” vale como “acao”.</li>
      </ol>

      <h2>O significado das cores</h2>
      <Ex cls="demo-c" letter="T">Letra certa no lugar certo. Aparece com um ponto.</Ex>
      <Ex cls="demo-p" letter="E">A letra existe na palavra, mas em outra posição. Aparece com um losango.</Ex>
      <Ex cls="demo-a" letter="R">A letra não está na palavra. Aparece com um traço.</Ex>
      <p>Além da cor, cada estado tem um símbolo próprio, para o jogo ser legível por quem não distingue bem as cores.</p>

      <h2>Letras repetidas</h2>
      <p>Se você digita uma letra duas vezes e a palavra tem só uma, apenas uma das duas recebe cor. A outra aparece como ausente.</p>

      <h2>Modos de jogo</h2>
      <h3>Palavra do dia</h3>
      <p>Uma palavra de 5 letras por dia, igual para todos os jogadores, com uma única tentativa de resolver. O dia vira à meia-noite de Brasília. Os resultados alimentam o ranking do dia, da semana e geral.</p>
      <h3>Solo</h3>
      <p>Palavras aleatórias de 4, 5 ou 6 letras, quantas partidas você quiser, para treinar.</p>
      <h3>Desafio por link</h3>
      <p>Você escolhe uma palavra, gera um link e envia a um amigo. A palavra fica protegida no servidor, e você vê quem jogou e em quantas tentativas.</p>
      <h3>Sala online</h3>
      <p>Até 8 jogadores, em rodadas de 5 minutos, com placar acumulado. Na <b>corrida</b>, todos adivinham a mesma palavra e vence quem acerta com menos tentativas. No <b>duelo</b>, cada jogador escolhe a palavra do próximo da roda.</p>

      <h2>Dicas para jogar melhor</h2>
      <ul>
        <li>Comece com palavras que tenham várias vogais diferentes, como “aurea” ou “ideia”.</li>
        <li>Use letras que já sabe que não existem para testar novas combinações.</li>
        <li>Preste atenção nas letras em posição errada: elas mostram onde a letra não está.</li>
      </ul>
      <p><Link href="/entrar" className="btn pri" style={{ maxWidth: 260 }}>Entrar e jogar</Link></p>
    </PublicShell>
  );
}
