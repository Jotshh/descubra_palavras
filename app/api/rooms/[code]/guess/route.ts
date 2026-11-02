import { NextResponse } from "next/server";
import { MAX, evaluate, norm } from "@/lib/game";
import { admin, authUser, fail, isValidWord } from "@/lib/server";
import { finalize, getPlayers, getRoom } from "@/lib/rooms";

type Ctx = { params: Promise<{ code: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const code = (await params).code.toUpperCase();
  const room = await getRoom(db, code);
  if (!room) return fail("Sala não encontrada", 404);
  if (room.status !== "playing") return fail("Não há rodada em andamento", 409);
  if (Date.now() >= new Date(room.round_ends_at).getTime()) { await finalize(db, room); return fail("Tempo esgotado", 409); }
  const players = await getPlayers(db, code);
  const me = players.find((p: any) => p.player === user.id);
  if (!me) return fail("Você não está nesta sala", 403);
  if (me.status !== "playing") return fail("Você já terminou esta rodada", 409);

  const g = norm(String((await req.json().catch(() => ({}))).guess ?? ""));
  if (g.length !== room.len) return fail("Faltam letras");
  if (!isValidWord(g)) return fail("Essa palavra não existe");
  const { data: sec } = await db.from("room_secrets").select("word").eq("room_code", code).eq("round", room.round).eq("target", user.id).maybeSingle();
  if (!sec) return fail("Palavra da rodada não encontrada", 500);

  const { data: play } = await db.from("room_plays").select("guesses").eq("room_code", code).eq("round", room.round).eq("player", user.id).maybeSingle();
  const guesses = [...(play?.guesses ?? []), g];
  const res = evaluate(g, sec.word);
  const status = g === sec.word ? "won" : guesses.length >= MAX ? "lost" : "playing";
  await db.from("room_plays").upsert({ room_code: code, round: room.round, player: user.id, guesses }, { onConflict: "room_code,round,player" });
  await db.from("room_players").update({ patterns: [...me.patterns, res.join("")], status }).eq("room_code", code).eq("player", user.id);

  if (status !== "playing" && players.every((p: any) => p.player === user.id || p.status !== "playing")) await finalize(db, room);
  return NextResponse.json({ res, status, word: status !== "playing" ? sec.word : undefined });
}
