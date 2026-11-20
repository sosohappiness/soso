// Now and then another friend comes over and sits on the sofa for the day.
// About one day in six, never two days in a row, and only after a few days together.
import type { AnimalId } from "../scene/animals";
import { localDay } from "./time";
import { shiftDay } from "./journal";

const ALL: AnimalId[] = ["polar", "fox", "dog"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rolls(day: string) {
  return hash(`visit-${day}`) % 6 === 0;
}

export function isVisitDay(now: Date, daysTogether: number): boolean {
  if (daysTogether < 3) return false;
  const today = localDay(now);
  if (!rolls(today)) return false;
  return !rolls(localDay(shiftDay(now, -1))); // never two days in a row
}

/** Which of the other two friends comes over (stable for the whole day). */
export function visitorFor(me: AnimalId, now: Date): AnimalId {
  const others = ALL.filter((a) => a !== me);
  return others[hash(localDay(now)) % others.length];
}

/** "살랑이" → "살랑아" (how you'd call a friend by name). */
export function callName(name: string): string {
  return name.endsWith("이") ? name.slice(0, -1) + "아" : name + "야";
}

/** Little conversations: [what the visitor says, what Minimi answers]. */
export const CHATS: [string, string][] = [
  ["오늘 하늘 예쁘다", "그치? 같이 보니까 더 좋아"],
  ["이 소파 엄청 푹신하다!", "내 자리 반 나눠 줄게"],
  ["너 요즘 표정이 좋아 보여", "고마워, 덕분이야"],
  ["우리 다음엔 같이 산책 가자", "좋아! 약속!"],
  ["구름꽃이 많이 피었네!", "매일 조금씩 피운 거야"],
  ["보고 싶었어", "나도! 와 줘서 고마워"],
];
