import { NextResponse } from "next/server";
import { norm } from "@/lib/game";
import { admin, authUser, fail, isValidWord } from "@/lib/server";
import { getPlayers, getRoom, touch } from "@/lib/rooms";

type Ctx = { params: Promise<{ code: string }> };

/** Duelo em anel: cada jogador escolhe a palavra do jogador seguinte. */
export async function POST(req: Request, { params }: Ctx) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const code = (await params).code.toUpperCase();
  const room = await getRoom(db, code);
  if (!room) return fail("Sala não encontrada", 404);
  if (room.mode !== "duel" || room.status !== "words") return fail("Agora não é hora de escolher palavra");
  const players = await getPlayers(db, code);
  const idx = players.findIndex((p: any) => p.player === user.id);
  if (idx < 0) return fail("Você não está nesta sala", 403);
  const { word } = await req.json().catch(() => ({}));
  const w = norm(String(word ?? "").trim());
  if (w.length !== room.len) return fail(`A palavra precisa ter ${room.len} letras`);
  if (!isValidWord(w)) return fail("Essa palavra não existe no dicionário");
  const target = players[(idx + 1) % players.length];
  await db.from("room_secrets").upsert({ room_code: code, round: room.round + 1, target: target.player, setter: user.id, word: w }, { onConflict: "room_code,round,target" });
  await db.from("room_players").update({ has_word: true }).eq("room_code", code).eq("player", user.id);
  await touch(db, room);
  return NextResponse.json({ ok: true });
}
