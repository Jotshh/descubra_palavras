export type Result = {
  id: string; at: string; mode: "solo" | "challenge" | "room"; len: number;
  won: boolean; attempts: number; word: string; secs?: number | null; synced?: boolean;
};
export const MODE_LABEL = { solo: "Modo solo", challenge: "Desafio de amigo", room: "Sala online" } as const;

const dayKey = (d: Date) => d.toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso local

export function computeStats(list: Result[]) {
  const wins = list.filter((r) => r.won);
  const dist = [0, 0, 0, 0, 0, 0];
  wins.forEach((r) => dist[Math.min(6, Math.max(1, r.attempts)) - 1]++);
  const mode = (m: Result["mode"]) => {
    const g = list.filter((r) => r.mode === m);
    return { games: g.length, wins: g.filter((r) => r.won).length };
  };

  const per: Record<string, number> = {};
  list.forEach((r) => { const k = dayKey(new Date(r.at)); per[k] = (per[k] || 0) + 1; });
  const days = Object.keys(per).sort();
  let best = 0, run = 0, prev: number | null = null;
  for (const k of days) {
    const t = Date.parse(`${k}T00:00:00`);
    run = prev !== null && Math.round((t - prev) / 86_400_000) === 1 ? run + 1 : 1;
    best = Math.max(best, run); prev = t;
  }
  let streak = 0;
  const d = new Date();
  if (!per[dayKey(d)]) d.setDate(d.getDate() - 1); // hoje ainda não quebra a sequência
  while (per[dayKey(d)]) { streak++; d.setDate(d.getDate() - 1); }

  const heat: { key: string; n: number }[] = [];
  const start = new Date(); start.setDate(start.getDate() - 90);
  for (let i = 0; i < 91; i++) {
    const x = new Date(start); x.setDate(start.getDate() + i);
    const key = dayKey(x); heat.push({ key, n: per[key] || 0 });
  }

  const rooms = list.filter((r) => r.mode === "room").sort((a, b) => a.at.localeCompare(b.at));
  let roomRun = 0, roomBest = 0;
  rooms.forEach((r) => { roomRun = r.won ? roomRun + 1 : 0; roomBest = Math.max(roomBest, roomRun); });
  const five = wins.filter((r) => r.len === 5).length;
  const ch = mode("challenge").games;

  const achievements = [
    { id: "primeira", title: "Primeira Dedução", desc: "Acertou a palavra na 1ª tentativa.", done: wins.some((r) => r.attempts === 1) },
    { id: "cinco", title: "Mestre das 5 Letras", desc: "50 vitórias em palavras de 5 letras.", done: five >= 50, prog: `${Math.min(five, 50)}/50` },
    { id: "invicto", title: "Invicto na Sala Online", desc: "5 vitórias seguidas em salas.", done: roomBest >= 5, prog: `${Math.min(roomBest, 5)}/5` },
    { id: "amizade", title: "Amizade Tátil", desc: "Jogou 10 desafios de amigos.", done: ch >= 10, prog: `${Math.min(ch, 10)}/10` },
    { id: "vocab", title: "Vocabulário Infinito", desc: "500 vitórias.", done: wins.length >= 500, prog: `${Math.min(wins.length, 500)}/500` },
    { id: "velocista", title: "Velocista da Palavra", desc: "Acertou em menos de 30 segundos.", done: wins.some((r) => r.secs != null && r.secs < 30) },
  ];

  return {
    games: list.length, wins: wins.length, dist,
    avg: wins.length ? wins.reduce((a, r) => a + r.attempts, 0) / wins.length : 0,
    modes: { solo: mode("solo"), challenge: mode("challenge"), room: mode("room") },
    streak, best, heat, active: heat.filter((h) => h.n > 0).length, achievements,
    recent: [...list].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10),
  };
}
