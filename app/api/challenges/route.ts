import { NextResponse } from "next/server";
import { norm } from "@/lib/game";
import { admin, authUser, fail, isValidWord, nickname } from "@/lib/server";

export async function POST(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login para criar um desafio", 401);
  const { word } = await req.json().catch(() => ({}));
  const w = norm(String(word ?? "").trim());
  if (!/^[a-z]{4,6}$/.test(w)) return fail("Use uma palavra de 4 a 6 letras");
  if (!isValidWord(w)) return fail("Essa palavra não existe no dicionário");
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  await admin().rpc("limpar_expirados");
  const { error } = await admin().from("challenges").insert({ id, creator: user.id, creator_name: nickname(user), word: w, len: w.length });
  if (error) return fail("Não foi possível criar o desafio", 500);
  return NextResponse.json({ id });
}
