"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const auth = supabase().auth;
    auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

/** Manda para /entrar se não houver sessão. */
export function useRequireLogin(next: string) {
  const s = useSession();
  useEffect(() => {
    if (s.ready && !s.session) location.href = `/entrar?next=${encodeURIComponent(next)}`;
  }, [s.ready, s.session, next]);
  return s;
}
