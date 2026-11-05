import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Resumo do site para modelos de linguagem (convenção llms.txt). */
export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Jogo de adivinhar palavras em português do Brasil. O jogador tem seis tentativas para descobrir a palavra secreta e, a cada palpite, recebe dicas de cor: letra certa no lugar certo, letra certa no lugar errado ou letra ausente. É gratuito e roda no navegador, no computador e no celular.

## Páginas públicas

- [Início](${SITE_URL}/): apresentação do jogo, modos de jogo e perguntas frequentes
- [Como jogar](${SITE_URL}/como-jogar): regras, significado das cores, letras repetidas, modos e dicas
- [Sobre](${SITE_URL}/sobre): o que é o projeto, privacidade, créditos e tecnologia

## Resumo dos recursos

- Modo solo com palavras de 4, 5 e 6 letras
- Palavra do dia de 5 letras, igual para todos, com ranking diário, semanal e geral
- Desafio por link: um jogador escolhe a palavra e outro tenta adivinhar
- Salas online com até 8 jogadores, em corrida (mesma palavra para todos) ou duelo, com placar por rodadas
- Perfil com estatísticas, conquistas e amigos

## Observações

- O idioma do site é o português do Brasil.
- Jogar exige uma conta com e-mail e senha. As páginas de jogo, perfil, salas, desafios, ranking e amigos exigem login e não são indexadas.
- Projeto independente, sem vínculo com outros jogos ou empresas.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
