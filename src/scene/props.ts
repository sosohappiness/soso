// Painted props for the gifts, plus the little particles each one gives off.
// Hand-held items share the cup's convention: their base sits at painter y = -0.15.
import { painted } from "../paint/painter";
import type { GiftId, Particle } from "../lib/gifts";
import { ANIMALS, cupTex } from "./animals";

const B = -0.15;

/** A plate of tteokbokki; `left` is how many pieces are still on it (eaten down to 0). */
export function plateTex(left: number) {
  return painted(`prop-plate-${left}`, 0.56, 0.4, (p) => {
    p.blob(0, B + 0.03, 0.2, 0.05, "#F6F2EA", { wob: 0.02 });
    p.blob(0, B + 0.04, 0.15, 0.033, "#ECE6DA", { wob: 0.03, fuzz: 0.003 });
    if (left > 0) p.blob(0, B + 0.045, 0.06 + left * 0.025, 0.02 + left * 0.004, "#C8442E", { wob: 0.08, fuzz: 0.004 });
    const cakes: [number, number, number][] = [[-0.07, 0.06, 0.4], [0.0, 0.07, -0.3], [0.07, 0.058, 0.2], [-0.03, 0.05, 1.3], [0.04, 0.045, -1.1]];
    for (const [x, y, r] of cakes.slice(0, left + (left > 2 ? 2 : 0))) p.blob(x, B + y, 0.04, 0.016, "#E86A45", { rot: r, fuzz: 0.003 });
    if (left > 1) p.blob(0.03, B + 0.075, 0.022, 0.012, "#F6D46A", { fuzz: 0.003 });
    if (left > 0) {
      p.stroke([[-0.03, B + 0.1], [-0.04, B + 0.15], [-0.025, B + 0.2]], "#FFFFFF", 0.008);
      p.stroke([[0.04, B + 0.1], [0.03, B + 0.15], [0.045, B + 0.2]], "#FFFFFF", 0.008);
    }
  }, { grain: 0.04 });
}

/** Speaker: a little wooden box with two cones and a handle. */
export function speakerTex() {
  return painted("prop-speaker", 0.6, 0.5, (p) => {
    p.poly([[-0.2, B + 0.27], [0.2, B + 0.27], [0.2, B], [-0.2, B]], "#B07A4F", { wob: 0.004 });
    p.glow(0, B + 0.22, 0.25, "#C99366", 0.6, 0.4);
    p.stroke([[-0.1, B + 0.27], [-0.08, B + 0.34], [0.08, B + 0.34], [0.1, B + 0.27]], "#6E4A2E", 0.02);
    for (const x of [-0.095, 0.095]) {
      p.blob(x, B + 0.12, 0.075, 0.075, "#3B2B2E", { fuzz: 0.003 });
      p.blob(x, B + 0.12, 0.035, 0.035, "#6B5B55", { fuzz: 0.003 });
    }
    p.blob(0, B + 0.23, 0.012, 0.012, "#F2C230", { fuzz: 0.002 });
  }, { grain: 0.05 });
}

// ---- the bath tub, in three layers so Minimi can sit inside it ----
// Tub space: origin on the ground at the tub's centre, rim at y = 0.55.
export const TUB = { w: 1.4, h: 0.9, rimY: 0.55, halfW: 0.6 };
const U = (x: number, y: number): [number, number] => [x, y - TUB.h / 2 + 0.02];

export function tubBackTex() {
  return painted("tub-back", TUB.w, TUB.h, (p) => {
    p.blob(...U(0, TUB.rimY), 0.6, 0.1, "#F7F4EE", { wob: 0.01 });
    p.blob(...U(0, TUB.rimY - 0.005), 0.54, 0.072, "#D8E3EA", { wob: 0.01, fuzz: 0.004 });
  }, { grain: 0.04 });
}

/** The water surface; scaled from the bottom of the tub up to the rim as it fills. */
export function tubWaterTex() {
  return painted("tub-water", 1.2, 0.2, (p) => {
    p.blob(0, 0, 0.53, 0.062, "#9FC8E6", { wob: 0.01, fuzz: 0.006 });
    p.glow(-0.18, 0.015, 0.22, "#D8ECF8", 0.8, 0.25);
  }, { grain: 0.02 });
}

export function tubFrontTex() {
  return painted("tub-front", TUB.w, TUB.h, (p) => {
    const pts = p.bezier(U(-0.6, TUB.rimY), [
      [U(-0.6, 0.25), U(-0.5, 0.1), U(-0.3, 0.09)],
      [U(-0.1, 0.08), U(0.1, 0.08), U(0.3, 0.09)],
      [U(0.5, 0.1), U(0.6, 0.25), U(0.6, TUB.rimY)],
      [U(0.3, TUB.rimY - 0.1), U(-0.3, TUB.rimY - 0.1), U(-0.6, TUB.rimY)],
    ], 16);
    p.fill(pts, "#F7F4EE", 0.008, 0.004);
    p.glow(0, U(0, 0.1)[1], 0.6, "#C9C2B6", 0.6, 0.35);
    p.glow(-0.25, U(0, 0.42)[1], 0.2, "#FFFFFF", 0.7, 0.5);
    // little feet
    for (const x of [-0.42, 0.42]) p.blob(...U(x, 0.05), 0.05, 0.05, "#C9A27A", { fuzz: 0.003 });
  }, { grain: 0.04 });
}

export function dropTex() {
  return painted("pt-drop", 0.1, 0.12, (p) => {
    p.poly([[0, 0.04], [0.02, 0.0], [0.018, -0.02], [0, -0.03], [-0.018, -0.02], [-0.02, 0.0]], "#9FC8E6", { wob: 0.002, fuzz: 0.002 });
  }, { grain: 0.01 });
}

/** What the squirrel carries in its paws (the bath tub is pushed in separately). */
export function giftItemTex(id: GiftId) {
  switch (id) {
    case "matcha": return cupTex(ANIMALS.polar);
    case "tteok": return plateTex(3);
    case "song": return speakerTex();
    case "bath": return null;
  }
}

export function particleTex(kind: Particle) {
  switch (kind) {
    case "bubble":
      return painted("pt-bubble", 0.14, 0.14, (p) => {
        p.ctx.globalAlpha = 0.35;
        p.blob(0, 0, 0.04, 0.04, "#FFFFFF", { fuzz: 0 });
        p.ctx.globalAlpha = 1;
        const ring: [number, number][] = [];
        for (let i = 0; i <= 24; i++) ring.push([Math.cos((i / 24) * Math.PI * 2) * 0.04, Math.sin((i / 24) * Math.PI * 2) * 0.04]);
        p.stroke(ring, "#FFFFFF", 0.006);
        p.blob(-0.014, 0.016, 0.008, 0.006, "#FFFFFF", { fuzz: 0 });
      }, { grain: 0 });
    case "note":
      return painted("pt-note", 0.16, 0.18, (p) => {
        p.blob(-0.02, -0.04, 0.025, 0.019, "#6B5CA5", { rot: -0.4, fuzz: 0.003 });
        p.stroke([[0.003, -0.035], [0.003, 0.06]], "#6B5CA5", 0.009);
        p.stroke([[0.003, 0.06], [0.04, 0.035]], "#6B5CA5", 0.009);
      }, { grain: 0.02 });
    default:
      return painted("heart", 0.16, 0.16, (p) => {
        p.blob(-0.022, 0.012, 0.026, 0.024, "#F4A3B4", { fuzz: 0.004 });
        p.blob(0.022, 0.012, 0.026, 0.024, "#F4A3B4", { fuzz: 0.004 });
        p.poly([[-0.046, 0.008], [0.046, 0.008], [0, -0.045]], "#F4A3B4", { wob: 0.003, fuzz: 0.004 });
      }, { grain: 0.02 });
  }
}
