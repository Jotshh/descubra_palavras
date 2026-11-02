export type State = "c" | "p" | "a"; // c = acerto, p = posição errada, a = ausente
export const MAX = 6;
export const LENGTHS = [4, 5, 6] as const;
/** "all": sorteia de qualquer palavra do dicionário. "common": só palavras comuns (lexico + frequência). */
export const SECRET_MODE: "all" | "common" = "all";

export const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function evaluate(guess: string, secret: string): State[] {
  const n = secret.length;
  const res: State[] = Array(n).fill("a");
  const left: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    if (guess[i] === secret[i]) res[i] = "c";
    else left[secret[i]] = (left[secret[i]] || 0) + 1;
  }
  for (let i = 0; i < n; i++) {
    if (res[i] === "a" && left[guess[i]] > 0) { res[i] = "p"; left[guess[i]]--; }
  }
  return res;
}
