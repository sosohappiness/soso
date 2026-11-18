export type Phase = "morning" | "day" | "evening" | "night";

/** 05–11 morning, 11–17 day, 17–22 evening, 22–05 night (device local time). */
export function phaseAt(d: Date): Phase {
  const h = d.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export const PHASE_LABEL: Record<Phase, string> = {
  morning: "아침이야",
  day: "낮이야",
  evening: "저녁이 왔어",
  night: "밤이 깊었어",
};

/** 12-hour clock without am/pm, like the mockup ("7:42"). */
export function clockText(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Local calendar day as YYYY-MM-DD — the unit for "one gift a day". */
export function localDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Dev overrides from the URL, e.g. ?time=19:42 or ?time=8 freezes the clock.
 * Returns null when the real clock should be used.
 */
export function timeOverride(search: string): Date | null {
  const t = new URLSearchParams(search).get("time");
  if (!t) return null;
  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(t);
  if (!m) return null;
  const d = new Date();
  d.setHours(Math.min(23, Number(m[1])), Number(m[2] ?? 0), 0, 0);
  return d;
}
