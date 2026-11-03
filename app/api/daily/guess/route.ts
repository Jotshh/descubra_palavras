import { NextResponse } from "next/server";
import { MAX, evaluate, norm } from "@/lib/game";
import { dailyWord } from "@/lib/daily";
import { todayKey } from "@/lib/dates";
import { admin, authUser, fail, isValidWord } from "@/lib/server";

export async function POST(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const g = norm(String((await req.json().catch(() => ({}))).guess ?? ""));
  if (g.length !== 5) return fail("Faltam letras");
  if (!isValidWord(g)) return fail("Essa palavra não existe");
  const db = admin();
  const day = todayKey();
  await db.from("daily_plays").upsert({ player: user.id, day }, { onConflict: "player,day", ignoreDuplicates: true });
  const { data: play } = await db.from("daily_plays").select("guesses,patterns,status").eq("player", user.id).eq("day", day).single();
  if (!play) return fail("Não foi possível carregar a palavra do dia", 500);
  if (play.status !== "playing") return fail("Você já jogou a palavra de hoje", 409);

  const secret = dailyWord(day);
  const res = evaluate(g, secret);
  const guesses = [...play.guesses, g];
  const patterns = [...play.patterns, res.join("")];
  const status = g === secret ? "won" : guesses.length >= MAX ? "lost" : "playing";
  const { error } = await db.from("daily_plays").update({
    guesses, patterns, status, finished_at: status !== "playing" ? new Date().toISOString() : null,
  }).eq("player", user.id).eq("day", day);
  if (error) return fail("Erro ao salvar o palpite", 500);
  return NextResponse.json({ res, status, word: status !== "playing" ? secret : undefined });
}
