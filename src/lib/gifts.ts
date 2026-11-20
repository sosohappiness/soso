// The five gifts you can give. Each has its own little scene: the helper polar bear brings it,
// and Minimi enjoys it in its own way (holds it, wears it, or gets it put on its face).
import { pick } from "./lines";

export type GiftId = "matcha" | "tteok" | "bath" | "pack" | "song";

/** hold: Minimi holds it in its paws. head: it goes on Minimi's head. face: it goes on the face. */
export type GiftKind = "hold" | "head" | "face";
export type Particle = "heart" | "bubble" | "note" | "sparkle";

export type Gift = {
  id: GiftId;
  label: string;   // on the button
  caption: string; // on the card and in 선물기록
  kind: GiftKind;
  particle: Particle;
  lines: string[]; // while enjoying it
  thanks: string;  // at the end
};

export const GIFTS: Record<GiftId, Gift> = {
  matcha: {
    id: "matcha", label: "말차라떼", caption: "따뜻한 말차라떼", kind: "hold", particle: "heart",
    lines: ["따뜻하다… 몸이 사르르 녹아", "음~ 쌉싸름하고 달콤해"], thanks: "잘 마셨어! 고마워",
  },
  tteok: {
    id: "tteok", label: "떡볶이", caption: "매콤달콤 떡볶이", kind: "hold", particle: "heart",
    lines: ["후후~ 매콤달콤 맛있어!", "쫀득쫀득 최고야"], thanks: "배불러~ 고마워!",
  },
  bath: {
    id: "bath", label: "따뜻한 목욕", caption: "따뜻한 거품 목욕", kind: "head", particle: "bubble",
    lines: ["으아~ 몸이 노곤노곤해", "보글보글 거품 목욕이다!"], thanks: "뽀송뽀송해졌어! 고마워",
  },
  pack: {
    id: "pack", label: "얼굴 팩", caption: "촉촉한 얼굴 팩", kind: "face", particle: "sparkle",
    lines: ["시원하다~ 피부가 촉촉해져", "나 지금 엄청 예뻐지는 중"], thanks: "반짝반짝! 고마워",
  },
  song: {
    id: "song", label: "노래", caption: "노래 한 곡", kind: "head", particle: "note",
    lines: ["랄라~ 이 노래 너무 좋아!", "흥얼흥얼~ 신난다"], thanks: "덕분에 신났어! 고마워",
  },
};

export const GIFT_ORDER: GiftId[] = ["matcha", "tteok", "bath", "pack", "song"];

export function enjoyLine(id: GiftId): string {
  return pick(GIFTS[id].lines);
}

/** The beats of every gift scene, in seconds. */
export const GIFT_T = { walkIn: 1.8, give: 2.6, drink: 5.4, leave: 7.0 };
