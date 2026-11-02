import { NextResponse } from "next/server";
import { admin, authUser, fail } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

/** Só o criador vê quem jogou e em quantas tentativas. */
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const { data: ch } = await db.from("challenges").select("creator").eq("id", id).maybeSingle();
  if (!ch) return fail("Desafio não encontrado", 404);
  if (ch.creator !== user.id) return fail("Só o criador vê os resultados", 403);
  const { data } = await db.from("plays").select("player_name,status,patterns").eq("challenge_id", id).order("updated_at");
  const results = (data ?? []).map((p) => ({ name: p.player_name, status: p.status, attempts: p.patterns.length }));
  return NextResponse.json({ results });
}
