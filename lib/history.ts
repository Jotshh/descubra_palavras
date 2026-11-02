import { supabase } from "./supabase";
import type { Result } from "./stats";

const KEEP = 500;
const KEY = (uid: string) => `termo-history:${uid}`; // um histórico por conta neste aparelho

export function loadLocal(uid: string): Result[] {
  try { const v = JSON.parse(localStorage.getItem(KEY(uid)) || "[]"); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
function saveLocal(uid: string, list: Result[]) {
  const sorted = [...list].sort((a, b) => b.at.localeCompare(a.at)).slice(0, KEEP);
  try { localStorage.setItem(KEY(uid), JSON.stringify(sorted)); } catch {}
}

/** Envia o que ainda não subiu e traz o que veio de outros aparelhos. */
export async function sync(uid: string): Promise<Result[]> {
  const db = supabase();
  let list = loadLocal(uid);
  const pending = list.filter((r) => !r.synced);
  if (pending.length) {
    const { error } = await db.from("game_results").upsert(
      pending.map((r) => ({ player: uid, id: r.id, mode: r.mode, len: r.len, won: r.won, attempts: r.attempts, word: r.word, secs: r.secs ?? null, played_at: r.at })),
      { onConflict: "player,id", ignoreDuplicates: true },
    );
    if (error) throw error;
    list = list.map((r) => ({ ...r, synced: true }));
  }
  const { data, error } = await db.from("game_results").select("id,mode,len,won,attempts,word,secs,played_at")
    .eq("player", uid).order("played_at", { ascending: false }).limit(KEEP);
  if (error) throw error;
  const have = new Set(list.map((r) => r.id));
  for (const r of data ?? []) {
    if (!have.has(r.id)) list.push({ id: r.id, at: r.played_at, mode: r.mode, len: r.len, won: r.won, attempts: r.attempts, word: r.word, secs: r.secs, synced: true });
  }
  saveLocal(uid, list);
  return loadLocal(uid);
}

/** Salva a partida no aparelho na hora e tenta sincronizar com a conta. */
export async function recordGame(r: Omit<Result, "at" | "synced">) {
  const { data } = await supabase().auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  const list = loadLocal(uid);
  if (list.some((x) => x.id === r.id)) return;
  list.push({ ...r, at: new Date().toISOString(), synced: false });
  saveLocal(uid, list);
  try { await sync(uid); } catch {} // sem conexão: fica pendente e sobe no próximo sync
}
