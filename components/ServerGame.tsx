"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX, State, norm } from "@/lib/game";

export type Row = { w: string; res: State[] };
export type Reply = { res: State[]; status: string; word?: string };
const KEYS = ["qwertyuiop", "asdfghjkl", "⏎zxcvbnm⌫"];
const RANK: Record<State, number> = { a: 1, p: 2, c: 3 };

/** Tabuleiro cujo palpite é avaliado pelo servidor (a palavra secreta nunca chega aqui). */
export default function ServerGame(p: {
  len: number; rows: Row[]; status: string; word?: string; title?: string; embedded?: boolean;
  onFinish?: (r: { won: boolean; attempts: number; word?: string; secs: number }) => void;
  onGuess: (w: string) => Promise<Reply>;
}) {
  const { len, onGuess } = p;
  const [rows, setRows] = useState<Row[]>(p.rows);
  const [shown, setShown] = useState(p.rows.length);
  const [cur, setCur] = useState("");
  const [status, setStatus] = useState(p.status);
  const [word, setWord] = useState(p.word);
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState(false);
  const busy = useRef(false);
  const t0 = useRef(Date.now());
  const tries = useRef(p.rows.length);
  const over = status !== "playing";

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1400); };
  const wobble = () => { setShake(true); setTimeout(() => setShake(false), 400); };

  const submit = useCallback(async () => {
    if (busy.current || over) return;
    if (cur.length < len) { wobble(); return say("Faltam letras"); }
    busy.current = true;
    try {
      const r = await onGuess(cur);
      tries.current++;
      setRows((x) => [...x, { w: cur, res: r.res }]); setCur("");
      setTimeout(() => {
        setShown((n) => n + 1);
        if (r.status !== "playing") {
          setStatus(r.status); setWord(r.word);
          p.onFinish?.({ won: r.status === "won", attempts: tries.current, word: r.word, secs: Math.round((Date.now() - t0.current) / 1000) });
        }
        busy.current = false;
      }, len * 100 + 500);
    } catch (e) { wobble(); say((e as Error).message); busy.current = false; }
  }, [cur, len, over, onGuess, p]);

  const press = useCallback((k: string) => {
    if (over || busy.current) return;
    if (k === "⌫") setCur((c) => c.slice(0, -1));
    else if (k === "⏎") submit();
    else if (/^[a-z]$/.test(k)) setCur((c) => (c.length < len ? c + k : c));
  }, [over, len, submit]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") { if ((document.activeElement as HTMLElement)?.tagName === "BUTTON") return; press("⏎"); }
      else if (e.key === "Backspace") press("⌫");
      else { const c = norm(e.key); if (c.length === 1) press(c); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [press]);

  const ks: Record<string, State> = {};
  rows.slice(0, shown).forEach((g) => [...g.w].forEach((ch, i) => {
    if (!ks[ch] || RANK[g.res[i]] > RANK[ks[ch]]) ks[ch] = g.res[i];
  }));

  const size = len === 4 ? 68 : len === 6 ? 52 : 60;
  const finished = over && shown >= rows.length;
  return (
    <>
      {!p.embedded && (
        <nav className="top">
          <Link href="/" className="brand">← {p.title}</Link>
        </nav>
      )}
      <main className="game" style={{ ["--n" as string]: len, ["--t" as string]: `${size}px` }}>
        <div className="bar"><span>Tentativa {Math.min(rows.length + 1, MAX)} de {MAX}</span></div>
        <div className="board" aria-live="polite">
          {Array.from({ length: MAX }, (_, r) => {
            const g = rows[r]; const isCur = r === rows.length && !over;
            return (
              <div key={r} className={`row${isCur && shake ? " shake" : ""}`}>
                {Array.from({ length: len }, (_, c) => {
                  const ch = g ? g.w[c] : isCur ? cur[c] : "";
                  return <div key={c} className={`tile ${g ? g.res[c] : ch ? "f" : ""}`} style={{ ["--i" as string]: c }}>{ch}</div>;
                })}
              </div>
            );
          })}
        </div>
        {finished ? (p.embedded ? null : (
          <div className="result">
            <h2>{status === "won" ? `Você acertou em ${rows.length}!` : "Não foi dessa vez"}</h2>
            <p className="ok">A palavra era <b style={{ textTransform: "uppercase" }}>{word}</b>.</p>
            <Link href="/" className="btn pri">Voltar ao início</Link>
          </div>
        )) : (
          <div className="kb">
            {KEYS.map((row) => (
              <div className="kr" key={row}>
                {[...row].map((k) => (
                  <button key={k} className={`k${k === "⏎" || k === "⌫" ? " wide" : ""} ${ks[k] || ""}`} onClick={() => press(k)}
                    aria-label={k === "⏎" ? "Enter" : k === "⌫" ? "Apagar" : k}>{k === "⏎" ? "ENTER" : k.toUpperCase()}</button>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
