import { SECRET_MODE } from "./game";

export type Dict = { valid: Set<string>; pool: string[] };
const cache = new Map<number, Dict>();

/** Carrega os arquivos de /public/dict para o tamanho de palavra escolhido. */
export async function loadDict(len: number): Promise<Dict> {
  const hit = cache.get(len);
  if (hit) return hit;
  const valid: string[] = await (await fetch(`/dict/valid-${len}.json`)).json();
  const pool: string[] =
    SECRET_MODE === "common" ? await (await fetch(`/dict/common-${len}.json`)).json() : valid;
  const dict = { valid: new Set(valid), pool };
  cache.set(len, dict);
  return dict;
}

export const randomWord = (d: Dict) => d.pool[Math.floor(Math.random() * d.pool.length)];
