/** Dia atual no horário de Brasília (AAAA-MM-DD). O dia vira à meia-noite de Brasília para todos. */
export const todayKey = (d: Date = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(d);

/** Meia-noite de Brasília (UTC-3, sem horário de verão) do dia seguinte, em ISO. */
export function nextResetIso(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 3, 0, 0)).toISOString();
}

/** Segunda-feira da semana do dia informado (a semana do ranking começa na segunda). */
export function mondayOf(day: string) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
