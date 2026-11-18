import type { Phase } from "./time";

export const LINES: Record<Phase, string[]> = {
  morning: [
    "좋은 아침! 오늘은 무슨 일이 있을까?",
    "으아아~ 잘 잤다!",
    "기지개 쭈욱— 오늘도 잘 부탁해",
    "아침 햇살 따뜻하다",
  ],
  day: [
    "뭐 하고 있었어? 궁금해!",
    "점심은 맛있는 거 먹었어?",
    "나무 그늘 시원하다~",
    "나랑 잠깐 놀자!",
  ],
  evening: [
    "흠냐.. 졸려..",
    "오늘 하루도 고생 많았어..",
    "나 너무 피곤해..",
    "하암~ 눈이 감겨..",
  ],
  night: ["쿨쿨…", "음냐… 말차라떼…", "새근새근…"],
};

/** What Minimi says when poked. */
export const POKE: Record<Phase, string[]> = {
  morning: ["헤헤, 간지러워!", "아침부터 반가워!"],
  day: ["히히!", "왜 불렀어?", "같이 있어서 좋다"],
  evening: ["으응..? 나 불렀어..?", "조금만 더 누워 있을래.."],
  night: ["음냐.. 지금은 자는 시간이야..", "zzz.. 내일 놀자.."],
};

export const MISSED_YOU = "보고 싶었어!";

export function pick<T>(arr: T[], not?: T): T {
  if (arr.length < 2) return arr[0];
  let v = arr[Math.floor(Math.random() * arr.length)];
  while (v === not) v = arr[Math.floor(Math.random() * arr.length)];
  return v;
}
