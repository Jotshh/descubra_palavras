"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { expired } from "@/lib/session";
import { useSession } from "@/lib/useSession";

const PUBLIC = ["/", "/entrar", "/como-jogar", "/sobre"];

/** Pede login ao entrar no site e derruba a sessão depois de 7 dias do último login. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { session, ready } = useSession();
  const open = PUBLIC.includes(path); // páginas que qualquer visitante (e o Google) pode abrir sem login
  const valid = !!session && !expired(session);

  useEffect(() => {
    if (!ready || open) return;
    if (session && !valid) supabase().auth.signOut();
    else if (!session) location.href = `/entrar?next=${encodeURIComponent(path)}`;
  }, [ready, open, session, valid, path]);

  if (!open && !valid) return <p className="ok" style={{ textAlign: "center", marginTop: 80 }}>Carregando…</p>;
  return <>{children}</>;
}
