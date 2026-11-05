import { ensureProfile } from "./profiles";
import { admin, authUser, fail } from "./server";

/** Login + conta com e-mail + perfil. Contas anônimas não usam amigos. */
export async function friendsAuth(req: Request) {
  const user = await authUser(req);
  if (!user) return { error: fail("Faça login", 401) };
  if (user.is_anonymous) return { error: fail("Entre com e-mail para usar amigos", 403) };
  const db = admin();
  const profile = await ensureProfile(db, user);
  if (!profile) return { error: fail("Não foi possível carregar seu perfil", 500) };
  return { db, user, profile };
}

/** IDs das pessoas com amizade aceita. */
export async function friendIds(db: ReturnType<typeof admin>, me: string): Promise<string[]> {
  const { data } = await db.from("friendships").select("requester,addressee").eq("status", "accepted")
    .or(`requester.eq.${me},addressee.eq.${me}`);
  return (data ?? []).map((f: any) => (f.requester === me ? f.addressee : f.requester));
}
