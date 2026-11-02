import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
/** Cliente do navegador (criado sob demanda para não quebrar o build sem variáveis). */
export function supabase() {
  if (!client) client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return client;
}

/** Chama as rotas /api com o token do usuário logado. */
export async function api<T = any>(path: string, body?: unknown): Promise<T> {
  const { data } = await supabase().auth.getSession();
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Erro inesperado");
  return json as T;
}
