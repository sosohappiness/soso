// Painted props for the five gifts, plus the little particles each one gives off.
// Tray items share the cup's convention: their base sits at painter y = -0.15.
import { painted } from "../paint/painter";
import type { GiftId, Particle } from "../lib/gifts";
import { ANIMALS, cupTex } from "./animals";

const B = -0.15;

export function tteokTex() {
  return painted("prop-tteok", 0.5, 0.5, (p) => {
    p.blob(0, B + 0.005, 0.1, 0.018, "#F6F2EA");
    p.poly([[-0.14, B + 0.12], [0.14, B + 0.12], [0.1, B + 0.02], [-0.1, B + 0.02]], "#F6F2EA", { wob: 0.004 });
    p.blob(0, B + 0.12, 0.14, 0.03, "#C8442E", { fuzz: 0.004 });
    const cakes: [number, number, number][] = [[-0.06, 0.14, 0.4], [0.0, 0.15, -0.3], [0.06, 0.135, 0.2], [-0.02, 0.13, 1.2]];
    for (const [x, y, r] of cakes) p.blob(x, B + y, 0.038, 0.016, "#E86A45", { rot: r, fuzz: 0.003 });
    p.blob(0.03, B + 0.16, 0.02, 0.012, "#F6D46A", { fuzz: 0.003 });
    p.stroke([[-0.03, B + 0.19], [-0.04, B + 0.24], [-0.025, B + 0.29]], "#FFFFFF", 0.008);
    p.stroke([[0.04, B + 0.19], [0.03, B + 0.24], [0.045, B + 0.29]], "#FFFFFF", 0.008);
  }, { grain: 0.04 });
}

export function towelTex() {
  return painted("prop-towel", 0.5, 0.3, (p) => {
    p.poly([[-0.17, 0.05], [0.17, 0.06], [0.18, -0.03], [-0.18, -0.04]], "#F4B6C2", { wob: 0.006, fuzz: 0.006 });
    p.poly([[-0.17, 0.0], [0.17, 0.01], [0.17, -0.01], [-0.17, -0.02]], "#E79AAA", { wob: 0.003, fuzz: 0.002 });
    p.glow(-0.05, 0.04, 0.12, "#FFFFFF", 0.35, 0.4);
  }, { grain: 0.05 });
}

export function maskTex() {
  return painted("prop-mask", 0.75, 0.6, (p) => {
    p.fill(p.ellipse(0, 0, 0.3, 0.2, 0.04), "#CFE3B4", 0.008, 0.012);
    p.glow(-0.1, 0.07, 0.14, "#FFFFFF", 0.4, 0.6);
  }, { grain: 0.05 });
}

export function jarTex() {
  return painted("prop-jar", 0.5, 0.5, (p) => {
    p.poly([[-0.07, B + 0.15], [0.07, B + 0.15], [0.075, B], [-0.075, B]], "#CFE3B4", { wob: 0.003 });
    p.blob(0, B + 0.165, 0.08, 0.025, "#8FB06A", { fuzz: 0.003 });
    p.glow(-0.03, B + 0.09, 0.05, "#FFFFFF", 0.5, 1.4);
  }, { grain: 0.04 });
}

/** Headphones: band over the head, cups at the ears. Centre sits at the middle of the band's span. */
export function headphonesTex() {
  return painted("prop-headphones", 0.95, 0.7, (p) => {
    const band = p.bezier([-0.34, -0.06], [[[-0.36, 0.2], [-0.2, 0.3], [0, 0.3]], [[0.2, 0.3], [0.36, 0.2], [0.34, -0.06]]], 18);
    p.stroke(band, "#E07A5F", 0.045);
    p.blob(-0.35, -0.09, 0.075, 0.1, "#C8604A");
    p.blob(0.35, -0.09, 0.075, 0.1, "#C8604A");
  }, { grain: 0.04 });
}

export function giftItemTex(id: GiftId) {
  switch (id) {
    case "matcha": return cupTex(ANIMALS.polar);
    case "tteok": return tteokTex();
    case "bath": return towelTex();
    case "pack": return jarTex();
    case "song": return headphonesTex();
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
    case "sparkle":
      return painted("pt-sparkle", 0.14, 0.14, (p) => {
        p.poly([[0, 0.05], [0.012, 0.012], [0.05, 0], [0.012, -0.012], [0, -0.05], [-0.012, -0.012], [-0.05, 0], [-0.012, 0.012]], "#F6D46A", { wob: 0.002, fuzz: 0.003 });
      }, { grain: 0.02 });
    default:
      return painted("heart", 0.16, 0.16, (p) => {
        p.blob(-0.022, 0.012, 0.026, 0.024, "#F4A3B4", { fuzz: 0.004 });
        p.blob(0.022, 0.012, 0.026, 0.024, "#F4A3B4", { fuzz: 0.004 });
        p.poly([[-0.046, 0.008], [0.046, 0.008], [0, -0.045]], "#F4A3B4", { wob: 0.003, fuzz: 0.004 });
      }, { grain: 0.02 });
  }
}
