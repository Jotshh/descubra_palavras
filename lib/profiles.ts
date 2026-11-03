import { norm } from "./game";
import { admin, nickname } from "./server";

/** Garante que a conta (e-mail ou Google) tenha um perfil com @ único gerado a partir do apelido. */
export async function ensureProfile(db: ReturnType<typeof admin>, user: any) {
  const { data } = await db.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (data) return data;
  let base = norm(nickname(user)).replace(/[^a-z0-9_]/g, "").slice(0, 14);
  if (base.length < 3) base = "jogador";
  for (let i = 0; i < 8; i++) {
    const handle = i === 0 ? base : `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
    const { data: row, error } = await db.from("profiles").insert({ user_id: user.id, handle }).select().single();
    if (!error) return row;
    if (error.code !== "23505") break; // só repete se o @ já existir
  }
  return null;
}
