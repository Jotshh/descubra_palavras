import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/profiles";
import { admin, authUser, fail } from "@/lib/server";

const COOLDOWN_DAYS = 30; // intervalo mínimo entre trocas de @ (a primeira troca é livre)

const shape = (p: any) => {
  const next = p.handle_changed_at ? new Date(p.handle_changed_at).getTime() + COOLDOWN_DAYS * 86_400_000 : 0;
  return { handle: p.handle, showInRanking: p.show_in_ranking, nextChangeAt: next > Date.now() ? new Date(next).toISOString() : null };
};

export async function GET(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  if (user.is_anonymous) return NextResponse.json({ anonymous: true });
  const p = await ensureProfile(admin(), user);
  return p ? NextResponse.json(shape(p)) : fail("Não foi possível criar o perfil", 500);
}

export async function POST(req: Request) {
  const user = await authUser(req);
  if (!user) return fail("Faça login", 401);
  if (user.is_anonymous) return fail("Entre com e-mail para ter um @", 403);
  const db = admin();
  const p = await ensureProfile(db, user);
  if (!p) return fail("Não foi possível criar o perfil", 500);
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.showInRanking === "boolean") patch.show_in_ranking = body.showInRanking;
  if (typeof body.handle === "string") {
    const h = body.handle.trim().toLowerCase().replace(/^@/, "");
    if (h !== p.handle) {
      if (!/^[a-z0-9_]{3,20}$/.test(h)) return fail("Use de 3 a 20 caracteres: letras minúsculas, números ou _");
      if (p.handle_changed_at) {
        const next = new Date(p.handle_changed_at).getTime() + COOLDOWN_DAYS * 86_400_000;
        if (Date.now() < next) return fail(`Você poderá trocar o @ de novo em ${new Date(next).toLocaleDateString("pt-BR")}`);
      }
      patch.handle = h;
      patch.handle_changed_at = new Date().toISOString();
    }
  }
  if (Object.keys(patch).length) {
    const { error } = await db.from("profiles").update(patch).eq("user_id", user.id);
    if (error) return fail(error.code === "23505" ? "Esse @ já está em uso" : "Não foi possível salvar", error.code === "23505" ? 409 : 500);
  }
  return NextResponse.json({ ok: true });
}
