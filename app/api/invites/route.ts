import { NextResponse } from "next/server";
import { friendIds, friendsAuth } from "@/lib/friends";
import { getPlayers, getRoom } from "@/lib/rooms";
import { admin, authUser, fail } from "@/lib/server";

/** Convites de sala recebidos (só de salas que ainda não começaram). */
export async function GET(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  if (user.is_anonymous) return NextResponse.json({ invites: [] });
  const db = admin();
  const { data: inv } = await db.from("room_invites").select("id,room_code,from_user").eq("to_user", user.id);
  if (!inv?.length) return NextResponse.json({ invites: [] });
  const { data: rooms } = await db.from("rooms").select("code,mode,len,status").in("code", inv.map((i: any) => i.room_code));
  const { data: profs } = await db.from("profiles").select("user_id,handle").in("user_id", inv.map((i: any) => i.from_user));
  const room = new Map((rooms ?? []).map((r: any) => [r.code, r]));
  const handle = new Map((profs ?? []).map((p: any) => [p.user_id, p.handle]));
  const live = inv.filter((i: any) => room.get(i.room_code)?.status === "lobby");
  const stale = inv.filter((i: any) => !live.includes(i)).map((i: any) => i.id);
  if (stale.length) await db.from("room_invites").delete().in("id", stale);
  return NextResponse.json({
    invites: live.map((i: any) => ({ id: i.id, code: i.room_code, from: handle.get(i.from_user) ?? "?", mode: room.get(i.room_code).mode, len: room.get(i.room_code).len })),
  });
}

/** Convida um amigo (pelo @) para uma sala em que você está e que ainda não começou. */
export async function POST(req: Request) {
  const a = await friendsAuth(req);
  if ("error" in a) return a.error;
  const { db, user } = a;
  const body = await req.json().catch(() => ({}));
  const code = String(body.roomCode ?? "").toUpperCase();
  const h = String(body.handle ?? "").trim().toLowerCase().replace(/^@/, "");
  const room = await getRoom(db, code);
  if (!room) return fail("Sala não encontrada", 404);
  const players = await getPlayers(db, code);
  if (!players.some((p: any) => p.player === user.id)) return fail("Você não está nesta sala", 403);
  if (room.status !== "lobby") return fail("A sala já começou");
  const { data: target } = await db.from("profiles").select("user_id").eq("handle", h).maybeSingle();
  if (!target || !(await friendIds(db, user.id)).includes(target.user_id)) return fail("Só dá para convidar amigos");
  if (players.some((p: any) => p.player === target.user_id)) return fail("Esse amigo já está na sala");
  await db.from("room_invites").upsert({ room_code: code, from_user: user.id, to_user: target.user_id }, { onConflict: "room_code,to_user", ignoreDuplicates: true });
  return NextResponse.json({ ok: true });
}
