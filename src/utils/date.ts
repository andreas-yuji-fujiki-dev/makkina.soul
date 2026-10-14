function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Segunda-feira da semana `offset` semanas a partir de hoje (offset 0 = semana atual). */
export function mondayOf(offset: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow + offset * 7);
  return d;
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmt(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
