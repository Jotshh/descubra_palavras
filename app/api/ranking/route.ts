import { NextResponse } from "next/server";
import { mondayOf, todayKey } from "@/lib/dates";
import { friendIds } from "@/lib/friends";
import { admin, authUser, fail } from "@/lib/server";

type Agg = { id: string; handle: string; points: number; wins: number; games: number; attempts: number; secs: number };

/** Ranking geral (opt-in): scope = day | week | all. Contas anônimas e quem não ativou não aparecem. */
export async function GET(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const scope = new URL(req.url).searchParams.get("scope") ?? "day";
  const day = todayKey();
  const from = scope === "week" ? mondayOf(day) : scope === "all" ? "2000-01-01" : day;
  const db = admin();

  // group=friends: você e seus amigos (aceitar a amizade já vale como permissão). Padrão: ranking geral opt-in.
  const friends = new URL(req.url).searchParams.get("group") === "friends";
  let q: any = db.from("profiles").select("user_id,handle");
  if (friends) {
    if (user.is_anonymous) return fail("Entre com e-mail ou Google para ver o ranking entre amigos", 403);
    q = q.in("user_id", [user.id, ...(await friendIds(db, user.id))]);
  } else q = q.eq("show_in_ranking", true);
  const { data: profs } = await q;
  const names = new Map<string, string>((profs ?? []).map((p: any) => [p.user_id, p.handle]));
  if (!names.size) return NextResponse.json({ rows: [] });

  const { data: plays } = await db.from("daily_plays").select("player,patterns,status,started_at,finished_at")
    .gte("day", from).neq("status", "playing").in("player", [...names.keys()]);

  const agg = new Map<string, Agg>();
  for (const p of plays ?? []) {
    const a = agg.get(p.player) ?? { id: p.player, handle: names.get(p.player)!, points: 0, wins: 0, games: 0, attempts: 0, secs: 0 };
    const n = p.patterns.length;
    a.games++;
    if (p.status === "won") { a.wins++; a.points += Math.max(1, 7 - n); a.attempts += n; }
    if (p.finished_at) a.secs += Math.round((Date.parse(p.finished_at) - Date.parse(p.started_at)) / 1000);
    agg.set(p.player, a);
  }
  const avg = (a: Agg) => (a.wins ? a.attempts / a.wins : 99);
  const rows = [...agg.values()].sort(scope === "day"
    ? (a, b) => b.wins - a.wins || a.attempts - b.attempts || a.secs - b.secs
    : (a, b) => b.points - a.points || b.wins - a.wins || avg(a) - avg(b));
  return NextResponse.json({ rows: rows.slice(0, 100).map((a) => ({ ...a, me: a.id === user.id, id: undefined })) });
}
