/** URL pública do site. Em domínio próprio, defina NEXT_PUBLIC_SITE_URL na Vercel (sem barra no final). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://battle-term.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "TERMO COM MAETHOR E AMIGOS";
export const SITE_TITLE = `${SITE_NAME}: jogo de palavras em português para jogar com amigos`;
export const SITE_DESCRIPTION =
  "Jogo de adivinhar palavras em português: modo solo, palavra do dia, desafios por link e salas online com até 8 amigos. Grátis, direto no navegador.";
