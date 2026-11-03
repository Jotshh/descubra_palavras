import { NextResponse } from "next/server";
import { dailyWord } from "@/lib/daily";
import { nextResetIso, todayKey } from "@/lib/dates";
import { admin, authUser, fail } from "@/lib/server";

/** Estado da palavra de hoje. A palavra só é enviada quando o jogador termina. */
export async function GET(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const db = admin();
  const day = todayKey();
  await db.from("daily_plays").upsert({ player: user.id, day }, { onConflict: "player,day", ignoreDuplicates: true });
  const { data: play } = await db.from("daily_plays").select("guesses,patterns,status").eq("player", user.id).eq("day", day).single();
  if (!play) return fail("Não foi possível carregar a palavra do dia", 500);
  const rows = (play.guesses as string[]).map((w, i) => ({ w, res: play.patterns[i].split("") }));
  return NextResponse.json({
    day, rows, status: play.status, nextAt: nextResetIso(day), now: Date.now(),
    word: play.status !== "playing" ? dailyWord(day) : undefined,
  });
}
