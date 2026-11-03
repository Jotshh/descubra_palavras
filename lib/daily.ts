import c5 from "@/public/dict/common-5.json";

/** Palavra do dia: determinística pela data, escolhida entre as palavras comuns de 5 letras.
 *  DAILY_SALT (variável de ambiente, opcional) impede que alguém preveja as próximas palavras lendo o código. */
export function dailyWord(day: string) {
  const s = `${process.env.DAILY_SALT ?? "termo"}:${day}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return c5[(h >>> 0) % c5.length];
}
