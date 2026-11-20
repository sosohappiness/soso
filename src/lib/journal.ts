// The gratitude journal: up to three lines per day, stored on this device for now
// (Supabase comes later). The cloud's flowers are always computed from it, never stored.
import { load, save } from "./storage";
import { localDay } from "./time";
import type { Growth } from "./demo";

export type Journal = Record<string, string[]>; // "YYYY-MM-DD" → lines

export function loadJournal(): Journal {
  const j = load<Journal>("journal", {});
  return j && typeof j === "object" ? j : {};
}

export function saveJournal(j: Journal) {
  save("journal", j);
}

export function linesOf(j: Journal, day: string): string[] {
  return (j[day] ?? []).filter((l) => l.trim().length > 0);
}

/** One small flower per line; a big flower for every 7 days written (gaps are fine). */
export function growthFromJournal(j: Journal): Growth {
  const days = Object.keys(j).filter((d) => linesOf(j, d).length > 0);
  const flowers = days.reduce((n, d) => n + linesOf(j, d).length, 0);
  return { days: days.length, flowers, bigFlowers: Math.floor(days.length / 7) };
}

export function shiftDay(d: Date, by: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + by);
  return x;
}

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function dayLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return `${m}월 ${d}일 ${WEEK[w]}요일`;
}

/** Example entries for the preview build, so the calendar isn't empty on first open. */
export function sampleJournal(today: Date): Journal {
  const samples = [
    ["따뜻한 햇살", "친구의 안부 문자", "맛있는 저녁"],
    ["버스를 딱 맞춰 탔다", "동료가 커피를 사줬다"],
    ["푹 잔 아침", "좋아하는 노래를 들었다", "엄마랑 통화"],
    ["산책길에 고양이를 만났다"],
    ["점심 떡볶이", "일을 하나 끝냈다", "일찍 퇴근"],
    ["새 책을 샀다", "창밖 노을이 예뻤다"],
    ["따뜻한 샤워", "친구가 웃겨줬다", "내 편이 있다는 것"],
    ["주말 늦잠", "빨래가 뽀송하게 말랐다"],
  ];
  const gaps = [1, 2, 3, 5, 6, 8, 9, 12];
  const j: Journal = {};
  gaps.forEach((g, i) => (j[localDay(shiftDay(today, -g))] = samples[i]));
  return j;
}
