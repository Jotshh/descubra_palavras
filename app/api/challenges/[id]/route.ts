import { NextResponse } from "next/server";
import { admin, authUser, fail } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

/** Estado do desafio para o jogador logado. A palavra só é enviada quando ele termina. */
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const { data: ch } = await db.from("challenges").select("len,creator,creator_name,word").eq("id", id).maybeSingle();
  if (!ch) return fail("Desafio não encontrado", 404);
  const { data: play } = await db.from("plays").select("guesses,patterns,status").eq("challenge_id", id).eq("player", user.id).maybeSingle();
  const status = play?.status ?? "playing";
  const rows = (play?.guesses ?? []).map((w: string, i: number) => ({ w, res: play!.patterns[i].split("") }));
  return NextResponse.json({
    len: ch.len, creator: ch.creator_name, isCreator: ch.creator === user.id,
    rows, status, word: status !== "playing" ? ch.word : undefined,
  });
}
