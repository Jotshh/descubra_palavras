import { NextResponse } from "next/server";
import { admin, authUser, fail } from "@/lib/server";
import { finalize, getPlayers, getRoom } from "@/lib/rooms";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const code = (await params).code.toUpperCase();
  let room = await getRoom(db, code);
  if (!room) return fail("Sala não encontrada ou expirada. As salas somem 24 horas depois da última atividade.", 404);
  if (room.status === "playing" && Date.now() >= new Date(room.round_ends_at).getTime()) {
    await finalize(db, room);
    room = await getRoom(db, code);
  }
  const players = await getPlayers(db, code);
  const idx = players.findIndex((p: any) => p.player === user.id);
  const mine = players[idx];

  let rows: any[] = [];
  if (mine && room.round > 0) {
    const { data: play } = await db.from("room_plays").select("guesses").eq("room_code", code).eq("round", room.round).eq("player", user.id).maybeSingle();
    rows = (play?.guesses ?? []).map((w: string, i: number) => ({ w, res: mine.patterns[i]?.split("") ?? [] }));
  }
  let words: { nickname: string; word: string }[] | undefined;
  if (room.status === "finished") {
    const { data } = await db.from("room_secrets").select("target,word").eq("room_code", code).eq("round", room.round);
    words = (data ?? []).map((s: any) => ({ nickname: players.find((p: any) => p.player === s.target)?.nickname ?? "?", word: s.word }));
  }
  return NextResponse.json({
    room: { code, host: room.host, mode: room.mode, len: room.len, status: room.status, round: room.round, maxRounds: room.max_rounds, roundEndsAt: room.round_ends_at },
    players: players.map((p: any) => ({ id: p.player, nickname: p.nickname, seat: p.seat, status: p.status, patterns: p.patterns, score: p.score, hasWord: p.has_word })),
    joined: idx >= 0,
    me: { id: user.id, rows, setFor: room.mode === "duel" && idx >= 0 && players.length > 1 ? players[(idx + 1) % players.length].nickname : null },
    words, now: Date.now(),
  });
}
