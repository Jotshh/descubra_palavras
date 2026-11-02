import { NextResponse } from "next/server";
import { admin, authUser, fail } from "@/lib/server";
import { getPlayers, getRoom, startRound, touch } from "@/lib/rooms";

type Ctx = { params: Promise<{ code: string }> };

/** Só o criador. Corrida: inicia a rodada. Duelo: abre a fase de escolher palavras e, depois, inicia a rodada. */
export async function POST(req: Request, { params }: Ctx) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const code = (await params).code.toUpperCase();
  const room = await getRoom(db, code);
  if (!room) return fail("Sala não encontrada", 404);
  if (room.host !== user.id) return fail("Só o criador inicia a rodada", 403);
  if (room.status === "playing") return fail("Rodada em andamento", 409);
  if (room.status === "finished" && room.round >= room.max_rounds) return fail("A partida terminou. Crie uma nova sala.", 409);
  await touch(db, room);
  const players = await getPlayers(db, code);
  if (players.length < 2) return fail("São necessários pelo menos 2 jogadores");

  if (room.mode === "race") await startRound(db, room, players);
  else if (room.status === "words") {
    if (players.some((p: any) => !p.has_word)) return fail("Faltam jogadores escolherem a palavra");
    await startRound(db, room, players);
  } else {
    await db.from("room_players").update({ has_word: false, status: "waiting" }).eq("room_code", code);
    await db.from("rooms").update({ status: "words" }).eq("code", code);
  }
  return NextResponse.json({ ok: true });
}
