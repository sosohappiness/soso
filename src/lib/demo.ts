/**
 * Flower-cloud growth is computed from logs, never stored (see plan).
 * Week 1 has no journal yet, so ?days=N fakes N logged days (3 lines each).
 */
/** flowers: one small flower per gratitude line. bigFlowers: one per 7 logged days (any 7, gaps are fine). */
export type Growth = { days: number; flowers: number; bigFlowers: number };

export function growthFromDays(days: number): Growth {
  return { days, flowers: days * 3, bigFlowers: Math.floor(days / 7) };
}

/** ?days=N fakes N logged days; returns null when the real journal should be used. */
export function demoGrowth(search: string): Growth | null {
  const raw = new URLSearchParams(search).get("days");
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? growthFromDays(Math.min(400, Math.floor(n))) : null;
}
