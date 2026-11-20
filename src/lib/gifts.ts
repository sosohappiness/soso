// The four gifts you can give. The squirrel friend brings each one; every gift has its own scene.
import { pick } from "./lines";

export type GiftId = "matcha" | "tteok" | "bath" | "song";

/**
 * hold: Minimi holds it (cup, plate). bath: Minimi jumps into a tub the squirrel fills.
 * music: the squirrel sets a speaker down and plays a song.
 */
export type GiftKind = "hold" | "bath" | "music";
export type Particle = "heart" | "bubble" | "note";

/** Beats in seconds: arrive · hand over (or jump in / music on) · done enjoying · gone. */
export type Beats = { walkIn: number; give: number; drink: number; leave: number };

export type Gift = {
  id: GiftId;
  label: string;   // on the button
  caption: string; // on the card and in 선물기록
  kind: GiftKind;
  particle: Particle;
  hello: string;   // when the squirrel shows up
  lines: string[]; // while enjoying it
  thanks: string;  // at the end
  t: Beats;
};

export const GIFTS: Record<GiftId, Gift> = {
  matcha: {
    id: "matcha", label: "말차라떼", caption: "따뜻한 말차라떼", kind: "hold", particle: "heart",
    hello: "어? 그거 나 주는 거야?",
    lines: ["따뜻하다… 몸이 사르르 녹아", "음~ 쌉싸름하고 달콤해"], thanks: "잘 마셨어! 고마워",
    t: { walkIn: 1.8, give: 3.6, drink: 6.2, leave: 7.8 },
  },
  tteok: {
    id: "tteok", label: "떡볶이", caption: "한 접시 떡볶이", kind: "hold", particle: "heart",
    hello: "킁킁, 떡볶이 냄새!",
    lines: ["얌얌~ 매콤달콤 맛있어!", "냠냠, 쫀득쫀득해!"], thanks: "배불러~ 고마워!",
    t: { walkIn: 1.8, give: 2.8, drink: 6.4, leave: 8.0 },
  },
  bath: {
    id: "bath", label: "따뜻한 목욕", caption: "따뜻한 목욕", kind: "bath", particle: "bubble",
    hello: "우와, 욕조다!",
    lines: ["풍덩! 아~ 따뜻해", "보글보글~ 노곤노곤해"], thanks: "뽀송뽀송해졌어! 고마워",
    t: { walkIn: 2.0, give: 4.2, drink: 7.4, leave: 9.2 },
  },
  song: {
    id: "song", label: "노래 듣기", caption: "노래 한 곡", kind: "music", particle: "note",
    hello: "어? 스피커다!",
    lines: ["랄라~ 이 노래 너무 좋아!", "둠칫둠칫~ 신난다!"], thanks: "덕분에 신났어! 고마워",
    t: { walkIn: 1.8, give: 2.8, drink: 6.8, leave: 8.4 },
  },
};

export const GIFT_ORDER: GiftId[] = ["matcha", "tteok", "bath", "song"];

export function enjoyLine(id: GiftId): string {
  return pick(GIFTS[id].lines);
}

/** When the squirrel tips its teapot (matcha: into the cup, bath: into the tub). */
export function pourWindow(id: GiftId): [number, number] | null {
  const t = GIFTS[id].t;
  if (id === "matcha") return [t.walkIn + 0.1, t.give - 0.6];
  if (id === "bath") return [t.walkIn + 0.2, t.give - 0.35];
  return null;
}
