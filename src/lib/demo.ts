/**
 * Tree growth is computed from logs, never stored (see plan).
 * Week 1 has no journal yet, so ?days=N fakes N logged days (3 lines each).
 */
export type Growth = { leaves: number; flowers: number; days: number };

export function growthFromDays(days: number): Growth {
  return { days, leaves: days * 3, flowers: Math.floor(days / 7) };
}

export function demoGrowth(search: string): Growth {
  const raw = new URLSearchParams(search).get("days");
  const n = raw == null ? NaN : Number(raw);
  return growthFromDays(Number.isFinite(n) && n >= 0 ? Math.min(400, Math.floor(n)) : 21);
}
