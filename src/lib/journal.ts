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

const WEEK_FULL = ["일", "월", "화", "수", "목", "금", "토"];

/** Every entry, oldest first, as plain text for email, copying or a .txt file. */
export function journalText(j: Journal, now: Date, name = "So So"): string {
  const days = Object.keys(j).filter((d) => linesOf(j, d).length > 0).sort();
  const total = days.reduce((n, d) => n + linesOf(j, d).length, 0);
  const head = [
    `${name} 감사일기`,
    `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일까지 · ${days.length}일 · 꽃 ${total}송이`,
    "",
  ];
  const body = days.flatMap((d) => {
    const [y, m, dd] = d.split("-").map(Number);
    const w = WEEK_FULL[new Date(y, m - 1, dd).getDay()];
    return [`${y}년 ${m}월 ${dd}일 ${w}요일`, ...linesOf(j, d).map((l) => `· ${l}`), ""];
  });
  return [...head, ...body].join("\n").trimEnd() + "\n";
}

/** Mail apps cut very long links; past this the body is shortened and points to the file option. */
export const MAILTO_LIMIT = 1800;

export function mailtoHref(text: string, subject = "So So 감사일기"): { href: string; trimmed: boolean } {
  let body = text;
  let trimmed = false;
  if (encodeURIComponent(body).length > MAILTO_LIMIT * 3) {
    trimmed = true;
    // keep the newest entries: they're at the end
    const lines = text.split("\n");
    const head = lines.slice(0, 3);
    let tail: string[] = [];
    for (let i = lines.length - 1; i >= 3; i--) {
      const next = [lines[i], ...tail];
      if (encodeURIComponent([...head, "(최근 일기만 담았어요. 전체는 '파일로 저장'을 써 주세요.)", "", ...next].join("\n")).length > MAILTO_LIMIT * 3) break;
      tail = next;
    }
    body = [...head, "(최근 일기만 담았어요. 전체는 '파일로 저장'을 써 주세요.)", "", ...tail].join("\n");
  }
  return { href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, trimmed };
}
