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
    "구름 그늘 시원하다~",
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

/** Warm words Minimi says when you tap it, any time you are both awake. */
export const WARM: string[] = [
  "넌 할 수 있어!",
  "힘들면 쉬어도 돼",
  "오늘도 충분히 잘하고 있어",
  "천천히 가도 괜찮아",
  "네가 있어서 참 좋아",
  "물 한 잔 마시고 오자",
  "숨 한번 크게 쉬어 봐",
  "오늘 하늘 봤어? 예쁘더라",
  "너는 생각보다 멋진 사람이야",
  "잘 안 돼도 괜찮아, 내일 또 있잖아",
  "작은 것부터 하나씩!",
  "어깨 쭉 펴고~ 기지개!",
  "오늘 하루 수고 많았어",
  "나는 항상 네 편이야",
  "웃는 얼굴 보고 싶다",
  "맛있는 거 꼭 챙겨 먹어",
  "가끔은 그런 날도 있는 거야",
  "괜찮아, 다 괜찮아",
  "건강 잘 챙겨!",
  "넌 소중한 사람이야",
  "오늘 좀 멋있는데?",
  "오늘도 와 줘서 고마워",
  "따뜻한 거 한 잔 마시자",
  "충분히 쉬어도 돼",
  "너무 애쓰지 않아도 괜찮아",
  "네 편이 여기 하나 있어",
  "오늘 표정 좋다!",
  "느려도 괜찮아, 잘 가고 있어",
];

/** Lines that only make sense on certain days (0 = Sunday … 6 = Saturday). */
const BY_DAY: Record<number, string[]> = {
  0: ["일요일엔 푹 쉬자~", "내일을 위해 오늘은 느긋하게"],
  1: ["월요일도 화이팅!", "한 주의 시작, 천천히 가자"],
  2: ["화요일, 벌써 하루 지났다!"],
  3: ["수요일! 벌써 반이나 왔어", "주말까지 반 남았어, 힘내!"],
  4: ["주말이 다가온다!", "목요일만 버티면 돼!"],
  5: ["해피 금요일!", "불금이다~ 오늘 뭐 할 거야?", "주말이 코앞이야!"],
  6: ["토요일이다! 늦잠 잤어?", "주말엔 하고 싶은 거 하자"],
};

const TIME_POKE: Record<Phase, string[]> = {
  morning: ["헤헤, 간지러워!", "좋은 아침이야!"],
  day: ["히히!", "왜 불렀어?"],
  evening: ["으응..? 나 불렀어..?"],
  night: ["음냐.. 지금은 자는 시간이야..", "푹 자, 내일 또 만나..", "꿈에서 만나.."],
};

/** A new line every tap: mostly warm words, sometimes about the day of the week. Never the same twice in a row. */
export function pokeLine(phase: Phase, now: Date, prev?: string): string {
  if (phase === "night") return pick(TIME_POKE.night, prev);
  const r = Math.random();
  const pool = r < 0.3 ? BY_DAY[now.getDay()] : r < 0.42 ? TIME_POKE[phase] : WARM;
  return pick(pool, prev);
}

export const MISSED_YOU = "보고 싶었어!";

export function pick<T>(arr: T[], not?: T): T {
  if (arr.length < 2) return arr[0];
  let v = arr[Math.floor(Math.random() * arr.length)];
  while (v === not) v = arr[Math.floor(Math.random() * arr.length)];
  return v;
}
