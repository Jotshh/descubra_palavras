import { createClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import v4 from "@/public/dict/valid-4.json";
import v5 from "@/public/dict/valid-5.json";
import v6 from "@/public/dict/valid-6.json";
import c4 from "@/public/dict/common-4.json";
import c5 from "@/public/dict/common-5.json";
import c6 from "@/public/dict/common-6.json";
import { SECRET_MODE } from "./game";

const SETS: Record<number, Set<string>> = { 4: new Set(v4), 5: new Set(v5), 6: new Set(v6) };
export const isValidWord = (w: string) => !!SETS[w.length]?.has(w);

/** Cliente com service role: só roda no servidor e ignora RLS. */
export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export async function authUser(req: Request): Promise<User | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  const u = data.user;
  if (!u) return null;
  // Sessões valem 7 dias a partir do último login (o servidor também confere).
  if (Date.now() - new Date(u.last_sign_in_at ?? u.created_at).getTime() > 7 * 86_400_000) return null;
  return u;
}

export const nickname = (u: User) =>
  (u.user_metadata?.nickname as string) || (u.user_metadata?.name as string) || u.email?.split("@")[0] || "Jogador";

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

const POOLS: Record<number, string[]> = SECRET_MODE === "common" ? { 4: c4, 5: c5, 6: c6 } : { 4: v4, 5: v5, 6: v6 };
export const randomWord = (len: number) => POOLS[len][Math.floor(Math.random() * POOLS[len].length)];
