import { NextResponse } from "next/server";
import { MAX, evaluate, norm } from "@/lib/game";
import { admin, authUser, fail, isValidWord, nickname } from "@/lib/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const { guess } = await req.json().catch(() => ({}));
  const g = norm(String(guess ?? ""));
  const db = admin();
  const { data: ch } = await db.from("challenges").select("word,len").eq("id", id).maybeSingle();
  if (!ch) return fail("Desafio não encontrado ou expirado (somem 24 horas depois da última atividade)", 404);
  if (g.length !== ch.len) return fail("Faltam letras");
  if (!isValidWord(g)) return fail("Essa palavra não existe");
  const { data: play } = await db.from("plays").select("guesses,patterns,status").eq("challenge_id", id).eq("player", user.id).maybeSingle();
  if (play && play.status !== "playing") return fail("Você já terminou este desafio", 409);

  const res = evaluate(g, ch.word);
  const guesses = [...(play?.guesses ?? []), g];
  const patterns = [...(play?.patterns ?? []), res.join("")];
  const status = g === ch.word ? "won" : guesses.length >= MAX ? "lost" : "playing";
  const { error } = await db.from("plays").upsert(
    { challenge_id: id, player: user.id, player_name: nickname(user), guesses, patterns, status, updated_at: new Date().toISOString() },
    { onConflict: "challenge_id,player" },
  );
  if (error) return fail("Erro ao salvar o palpite", 500);
  await db.from("challenges").update({ last_activity: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ res, status, word: status !== "playing" ? ch.word : undefined });
}
