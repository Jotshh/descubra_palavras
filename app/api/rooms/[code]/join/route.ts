import { NextResponse } from "next/server";
import { admin, authUser, fail, nickname } from "@/lib/server";
import { MAX_PLAYERS, getPlayers, getRoom } from "@/lib/rooms";

type Ctx = { params: Promise<{ code: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const code = (await params).code.toUpperCase();
  const room = await getRoom(db, code);
  if (!room) return fail("Sala não encontrada", 404);
  const players = await getPlayers(db, code);
  if (players.some((p: any) => p.player === user.id)) return NextResponse.json({ ok: true });
  if (room.status !== "lobby") return fail("A partida já começou");
  if (players.length >= MAX_PLAYERS) return fail("Sala cheia");
  await db.from("room_players").insert({ room_code: code, player: user.id, nickname: nickname(user), seat: players.length });
  return NextResponse.json({ ok: true });
}
