"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { expired } from "@/lib/session";
import { useSession } from "@/lib/useSession";

const nextUrl = () => new URLSearchParams(location.search).get("next") || "/";

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [nick, setNick] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, ready } = useSession();
  useEffect(() => { if (ready && session && !expired(session)) location.href = nextUrl(); }, [ready, session]);

  const emailLogin = async (criar: boolean) => {
    setMsg(""); setBusy(true);
    const auth = supabase().auth;
    const { data, error } = criar
      ? await auth.signUp({ email, password: pass, options: { data: { nickname: email.split("@")[0] } } })
      : await auth.signInWithPassword({ email, password: pass });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (!data.session) return setMsg("Conta criada! Confirme seu e-mail para entrar.");
    location.href = nextUrl();
  };

  const semConta = async () => {
    if (nick.trim().length < 2) return setMsg("Digite um apelido com pelo menos 2 letras.");
    setMsg(""); setBusy(true);
    const { error } = await supabase().auth.signInAnonymously({ options: { data: { nickname: nick.trim() } } });
    setBusy(false);
    if (error) return setMsg(error.message);
    location.href = nextUrl();
  };

  return (
    <main className="panel">
      <div className="card">
        <h1>Entrar</h1>
        <input className="field" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input className="field" type="password" placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
        <div className="row2">
          <button className="btn pri" onClick={() => emailLogin(false)} disabled={busy}>Entrar</button>
          <button className="btn" onClick={() => emailLogin(true)} disabled={busy}>Criar conta</button>
        </div>
        <div className="sep">ou sem conta</div>
        <input className="field" placeholder="Seu apelido" value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} disabled />
        <button className="btn" onClick={semConta} disabled>Jogar só com apelido (em breve)</button>
        {msg && <p className="err" role="alert">{msg}</p>}
      </div>
    </main>
  );
}
