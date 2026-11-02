import { NextResponse } from "next/server";
import { admin, authUser, fail } from "@/lib/server";
import { finalize, getRoom } from "@/lib/rooms";

type Ctx = { params: Promise<{ code: string }> };

/** Chamada pelos clientes quando o tempo acaba, para fechar a rodada. Idempotente. */
export async function POST(req: Request, { params }: Ctx) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const room = await getRoom(db, (await params).code);
  if (room?.status === "playing" && Date.now() >= new Date(room.round_ends_at).getTime()) await finalize(db, room);
  return NextResponse.json({ ok: true });
}
