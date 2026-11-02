import type { Session } from "@supabase/supabase-js";

export const SESSION_DAYS = 7;
const DAY = 86_400_000;

/** A sessão vale por 7 dias a partir do último login (e-mail, Google ou apelido). */
export const expired = (s: Session) =>
  Date.now() - new Date(s.user.last_sign_in_at ?? s.user.created_at).getTime() > SESSION_DAYS * DAY;
