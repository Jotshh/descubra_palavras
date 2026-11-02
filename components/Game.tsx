"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LENGTHS, MAX, State, evaluate, norm } from "@/lib/game";
import { Dict, loadDict, randomWord } from "@/lib/dict";
import HelpModal from "./HelpModal";

type Guess = { w: string; res: State[] };
type Stats = { g: number; w: number; s: number };
const KEYS = ["qwertyuiop", "asdfghjkl", "⏎zxcvbnm⌫"];
const RANK: Record<State, number> = { a: 1, p: 2, c: 3 };

const readStats = (): Stats => {
  try { return JSON.parse(localStorage.getItem("termo-stats") || "") || { g: 0, w: 0, s: 0 }; }
  catch { return { g: 0, w: 0, s: 0 }; }
};

export default function Game() {
  const [len, setLen] = useState(5);
  const [dict, setDict] = useState<Dict | null>(null);
  const [secret, setSecret] = useState("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [cur, setCur] = useState("");
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [modal, setModal] = useState(false);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState(false);
  const [stats, setStats] = useState<Stats>({ g: 0, w: 0, s: 0 });
  const busy = useRef(false);

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1400); };

  const start = useCallback((d: Dict) => {
    setSecret(randomWord(d)); setGuesses([]); setRevealed(0); setCur("");
    setOver(false); setWon(false); setModal(false); busy.current = false;
  }, []);

  useEffect(() => {
    let alive = true;
    setDict(null);
    loadDict(len).then((d) => { if (alive) { setDict(d); start(d); } });
    return () => { alive = false; };
  }, [len, start]);

  const submit = useCallback(() => {
    if (!dict || over || busy.current) return;
    if (cur.length < len) { setShake(true); setTimeout(() => setShake(false), 400); return say("Faltam letras"); }
    if (!dict.valid.has(cur)) { setShake(true); setTimeout(() => setShake(false), 400); return say("Essa palavra não existe"); }
    busy.current = true;
    const g = { w: cur, res: evaluate(cur, secret) };
    const all = [...guesses, g];
    const win = cur === secret, done = win || all.length === MAX;
    setGuesses(all); setCur("");
    setTimeout(() => {
      setRevealed(all.length); busy.current = false;
      if (done) {
        const s = readStats();
        const n = { g: s.g + 1, w: s.w + (win ? 1 : 0), s: win ? s.s + 1 : 0 };
        try { localStorage.setItem("termo-stats", JSON.stringify(n)); } catch {}
        setStats(n); setWon(win); setOver(true); setModal(true);
      }
    }, len * 100 + 500);
  }, [dict, over, cur, len, secret, guesses]);

  const press = useCallback((k: string) => {
    if (over || busy.current || !dict) return;
    if (k === "⌫") setCur((c) => c.slice(0, -1));
    else if (k === "⏎") submit();
    else if (/^[a-z]$/.test(k)) setCur((c) => (c.length < len ? c + k : c));
  }, [over, dict, len, submit]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || help) return;
      if (e.key === "Enter") { if ((document.activeElement as HTMLElement)?.tagName === "BUTTON") return; press("⏎"); }
      else if (e.key === "Backspace") press("⌫");
      else { const c = norm(e.key); if (c.length === 1) press(c); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [press, help]);

  const kstate: Record<string, State> = {};
  guesses.slice(0, revealed).forEach((g) => [...g.w].forEach((ch, i) => {
    if (!kstate[ch] || RANK[g.res[i]] > RANK[kstate[ch]]) kstate[ch] = g.res[i];
  }));

  const share = async () => {
    const m = { c: "■", p: "◆", a: "□" };
    const t = `TERMO COM MAETHOR E AMIGOS ${won ? guesses.length : "X"}/${MAX}\n` +
      guesses.map((g) => g.res.map((x) => m[x]).join("")).join("\n");
    try { await navigator.clipboard.writeText(t); say("Resultado copiado"); } catch { say("Não foi possível copiar"); }
  };

  const size = len === 4 ? 68 : len === 6 ? 52 : 60;
  const attempt = Math.min(guesses.length + 1, MAX);

  return (
    <>
      <nav className="top">
        <Link href="/" className="brand">← TERMO COM MAETHOR E AMIGOS</Link>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="seg" role="group" aria-label="Tamanho da palavra">
            {LENGTHS.map((n) => (
              <button key={n} aria-pressed={n === len} onClick={() => n !== len && setLen(n)}>{n} letras</button>
            ))}
          </div>
          <button className="ghost" onClick={() => setHelp(true)} aria-label="Como jogar">?</button>
        </div>
      </nav>
      <main className="game" style={{ ["--n" as string]: len, ["--t" as string]: `${size}px` }}>
        <div className="bar">
          <span>Tentativa {attempt} de {MAX}</span>
          <div className="pills">{Array.from({ length: MAX }, (_, i) => <i key={i} className={i < attempt ? "on" : ""} />)}</div>
          <button className="ghost" disabled={!dict} onClick={() => dict && start(dict)}>Nova palavra</button>
        </div>
        <div className="board" aria-live="polite">
          {Array.from({ length: MAX }, (_, r) => {
            const g = guesses[r];
            const isCur = r === guesses.length && !over;
            return (
              <div key={r} className={`row${isCur && shake ? " shake" : ""}`}>
                {Array.from({ length: len }, (_, c) => {
                  const ch = g ? g.w[c] : isCur ? cur[c] : "";
                  const cls = g ? g.res[c] : ch ? "f" : "";
                  return <div key={c} className={`tile ${cls}`} style={{ ["--i" as string]: c }}>{ch}</div>;
                })}
              </div>
            );
          })}
        </div>
        <div className="kb">
          {KEYS.map((row) => (
            <div className="kr" key={row}>
              {[...row].map((k) => (
                <button key={k} className={`k${k === "⏎" || k === "⌫" ? " wide" : ""} ${kstate[k] || ""}`}
                  onClick={() => press(k)} aria-label={k === "⏎" ? "Enter" : k === "⌫" ? "Apagar" : k}>
                  {k === "⏎" ? "ENTER" : k.toUpperCase()}
                </button>
              ))}
            </div>
          ))}
        </div>
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
      {help && <HelpModal onClose={() => setHelp(false)} />}
      {modal && (
        <div className="ov">
          <div className="modal center" role="dialog" aria-modal="true">
            <h2>{won ? "Você acertou!" : "Não foi dessa vez"}</h2>
            <p>{won ? `Em ${guesses.length} ${guesses.length === 1 ? "tentativa" : "tentativas"}.` : "A palavra era:"}</p>
            <div className="word">{secret}</div>
            <div className="stats">
              <div><b>{stats.g}</b><span>Partidas</span></div>
              <div><b>{Math.round((stats.w / stats.g) * 100)}%</b><span>Vitórias</span></div>
              <div><b>{stats.s}</b><span>Sequência</span></div>
            </div>
            <button className="btn pri" onClick={() => dict && start(dict)}>Jogar de novo</button>
            <button className="btn" onClick={share}>Compartilhar resultado</button>
            <Link href="/" className="btn">Voltar ao início</Link>
          </div>
        </div>
      )}
    </>
  );
}
