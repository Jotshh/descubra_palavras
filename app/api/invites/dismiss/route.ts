import { NextResponse } from "next/server";
import { admin, authUser, fail } from "@/lib/server";

export async function POST(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  const { id } = await req.json().catch(() => ({}));
  await admin().from("room_invites").delete().eq("id", String(id ?? "")).eq("to_user", user.id);
  return NextResponse.json({ ok: true });
}
