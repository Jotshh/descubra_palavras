import { SupabaseClient } from "@supabase/supabase-js";
import { randomWord } from "./server";

export const ROUND_MS = 5 * 60 * 1000;
export const MAX_PLAYERS = 8;

export async function getRoom(db: SupabaseClient, code: string) {
  const { data } = await db.from("rooms").select("*").eq("code", code.toUpperCase()).maybeSingle();
  return data;
}
export async function getPlayers(db: SupabaseClient, code: string) {
  const { data } = await db.from("room_players").select("*").eq("room_code", code).order("seat");
  return data ?? [];
}

/** Fecha a rodada (idempotente): quem não terminou perde; quem acertou ganha 7 - tentativas. */
export async function finalize(db: SupabaseClient, room: any) {
  const { data: closed } = await db.from("rooms").update({ status: "finished" }).eq("code", room.code).eq("status", "playing").select("code");
  if (!closed?.length) return;
  const players = await getPlayers(db, room.code);
  await Promise.all(players.map((p: any) =>
    db.from("room_players").update({
      status: p.status === "won" ? "won" : "lost",
      score: p.score + (p.status === "won" ? Math.max(1, 7 - p.patterns.length) : 0),
    }).eq("room_code", room.code).eq("player", p.player)));
}

/** Corrida: sorteia uma palavra para todos. Duelo: as palavras já foram definidas na fase "words". */
export async function startRound(db: SupabaseClient, room: any, players: any[]) {
  const round = room.round + 1;
  if (room.mode === "race") {
    const word = randomWord(room.len);
    await db.from("room_secrets").insert(players.map((p) => ({ room_code: room.code, round, target: p.player, setter: null, word })));
  }
  await db.from("room_players").update({ status: "playing", patterns: [], has_word: false }).eq("room_code", room.code);
  await db.from("rooms").update({ status: "playing", round, round_ends_at: new Date(Date.now() + ROUND_MS).toISOString() }).eq("code", room.code);
}

/** Registra atividade (no máximo 1 vez por minuto) para a limpeza das salas paradas há 24h. */
export async function touch(db: SupabaseClient, room: any) {
  if (Date.now() - new Date(room.last_activity).getTime() < 60_000) return;
  await db.from("rooms").update({ last_activity: new Date().toISOString() }).eq("code", room.code);
}
