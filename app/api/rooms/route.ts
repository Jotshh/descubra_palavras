import { NextResponse } from "next/server";
import { admin, authUser, fail, nickname } from "@/lib/server";

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), (n) => ALPHA[n % ALPHA.length]).join("");

export async function POST(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const { mode, len } = await req.json().catch(() => ({}));
  if (!["race", "duel"].includes(mode) || ![4, 5, 6].includes(len)) return fail("Dados inválidos");
  const db = admin();
  const code = newCode();
  const { error } = await db.from("rooms").insert({ code, host: user.id, mode, len });
  if (error) return fail("Não foi possível criar a sala", 500);
  await db.from("room_players").insert({ room_code: code, player: user.id, nickname: nickname(user), seat: 0 });
  return NextResponse.json({ code });
}
