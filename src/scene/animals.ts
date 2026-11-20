// Minimi: one fluffy gumdrop silhouette (head and body as one mass), black dot eyes, a plain
// nose, no mouth. The three friends share that shape; only ears, colours and the muzzle change.
// Shapes follow the character sheet; sheet pixels convert to world units with K.
import { painted, type Painter, type Pt } from "../paint/painter";

export type AnimalId = "polar" | "fox" | "dog";

export type Animal = {
  id: AnimalId;
  name: string;    // the character's name
  species: string;
  drink: string;   // signature drink
  body: string;
  paw: string;
  ear: string;
  muzzle?: string;
  ears: "round" | "pointy" | "floppy";
  noseW: number;   // nose size in sheet px
  cup: "matcha" | "iced" | "cocoa";
};

export const ANIMALS: Record<AnimalId, Animal> = {
  polar: {
    id: "polar", name: "뽀송이", species: "북극곰", drink: "따뜻한 말차라떼",
    body: "#F6F2EA", paw: "#F6F2EA", ear: "#F6F2EA", ears: "round", noseW: 12, cup: "matcha",
  },
  fox: {
    id: "fox", name: "살랑이", species: "여우", drink: "아이스 라떼",
    body: "#D9733A", paw: "#3B2B2E", ear: "#D9733A", muzzle: "#F3E4CB", ears: "pointy", noseW: 11, cup: "iced",
  },
  dog: {
    id: "dog", name: "토닥이", species: "강아지", drink: "핫초코",
    body: "#F6F2EA", paw: "#F6F2EA", ear: "#4A3428", ears: "floppy", noseW: 13, cup: "cocoa",
  },
};

export function animalFromSearch(search: string): AnimalId | null {
  let a = new URLSearchParams(search).get("animal");
  if (a === "redpanda") a = "fox";
  return a && a in ANIMALS ? (a as AnimalId) : null;
}

// ---- geometry --------------------------------------------------------------

/** Sheet px → world units. The silhouette is 244 px tall on the sheet → 1.2 units here. */
export const K = 1.2 / 244;
const BASE = -0.72; // painter y of the silhouette's base inside the body texture

/** Sheet coords (x from centre, y up from the base) → painter coords of the body texture. */
const s = (x: number, y: number): Pt => [x * K, y * K + BASE];
/** Sheet coords → world offset from Minimi's base point (for eyes, nose, paws). */
export const at = (x: number, y: number): [number, number] => [x * K, y * K];

export const BODY_TEX = { w: 1.5, h: 1.7, baseY: BASE };

export const FACE = {
  eyeL: at(-26, 174), eyeR: at(26, 174),
  nose: at(0, 144),
  headTop: at(0, 250),
};

function silhouette(p: Painter): Pt[] {
  return p.bezier(s(-96, 0), [
    [s(-96, 80), s(-82, 134), s(-72, 178)],
    [s(-62, 224), s(-34, 244), s(0, 244)],
    [s(34, 244), s(62, 224), s(72, 178)],
    [s(82, 134), s(96, 80), s(96, 0)],
    [s(40, -4), s(-40, -4), s(-96, 0)],
  ]);
}

const FUR = 0.03;

export function bodyTex(a: Animal) {
  return painted(`minimi-${a.id}`, BODY_TEX.w, BODY_TEX.h, (p) => {
    p.fill(silhouette(p), a.body, 0.008, FUR);
    if (a.muzzle) p.fill(p.ellipse(...s(0, 136), 36 * K, 25 * K, 0.05), a.muzzle, 0.006, FUR * 0.35);
    p.strands(900, 0.035);
  }, { grain: 0.06, mottle: 0.05 });
}

// ---- ears: separate sprites so they can show the mood --------------------------

// ---- lying pose: torso, head and limbs as separate fluffy pieces -----------------
// Coordinates are world units in Minimi's own space: x along the sofa, y up from the seat.

export const LIE = {
  torso: { x: 0.15, y: 0.19 },
  head: { x: -0.42, y: 0.36 },
  armUp: { x: -0.12, y: 0.33, len: 0.42, w: 0.13 },
  armRest: { x: -0.27, y: 0.2, len: 0.28, w: 0.13 },
  legOut: { x: 0.55, y: 0.11, len: 0.36, w: 0.16 },
  legTuck: { x: 0.42, y: 0.12, len: 0.28, w: 0.15 },
  tail: { x: 0.74, y: 0.22 },
  face: { eyeL: [-0.085, 0.035] as [number, number], eyeR: [0.085, 0.035] as [number, number], nose: [0, -0.055] as [number, number] },
};

export function torsoTex(a: Animal) {
  return painted(`torso-${a.id}`, 1.5, 0.7, (p) => {
    p.fill(p.ellipse(-0.04, 0, 0.56, 0.18, 0.03), a.body, 0.008, FUR);
    p.fill(p.ellipse(0.3, 0.02, 0.27, 0.2, 0.04), a.body, 0.008, FUR);
    p.strands(500, 0.035);
  }, { grain: 0.06, mottle: 0.05 });
}

export function headTex(a: Animal) {
  return painted(`head-lie-${a.id}`, 0.8, 0.75, (p) => {
    p.fill(p.ellipse(0, 0, 0.27, 0.245, 0.03), a.body, 0.008, FUR);
    if (a.muzzle) p.fill(p.ellipse(0, -0.07, 0.13, 0.085, 0.05), a.muzzle, 0.006, FUR * 0.35);
    p.strands(160, 0.03);
  }, { grain: 0.06, mottle: 0.05 });
}

/** A fluffy capsule limb that grows up from its joint at (0,0); the sprite pivot sits at the joint. */
export function limbTex(a: Animal, len: number, w: number, kind: "arm" | "leg") {
  const H = len + w + 0.12;
  const y0 = -H / 2 + 0.06 + w / 2; // joint
  const art = painted(`limb-${a.id}-${kind}-${len}-${w}`, w + 0.16, H, (p) => {
    p.fill(p.ellipse(0, y0 + len / 2, w / 2, len / 2 + w / 2, 0.04), a.body, 0.006, FUR * 0.7);
    // paw at the end: dark socks on the fox, the same fluff on the others
    p.fill(p.ellipse(0, y0 + len - w * 0.05, w * 0.52, w * 0.5, 0.05), a.paw === a.body ? a.body : a.paw, 0.006, FUR * 0.5);
    p.strands(60, 0.025);
  }, { grain: 0.06, mottle: 0.05 });
  return { art, pivot: [0, y0] as [number, number] };
}

export function tailTex(a: Animal) {
  return painted(`tail-lie-${a.id}`, 0.6, 0.5, (p) => {
    if (a.id === "fox") {
      p.fill(p.ellipse(0.06, 0.02, 0.2, 0.1, 0.05, 0.35), a.body, 0.008, FUR);
      p.fill(p.ellipse(0.2, 0.08, 0.07, 0.06, 0.05), "#F3E4CB", 0.006, FUR * 0.6);
    } else if (a.id === "dog") {
      p.fill(p.ellipse(0.04, 0.06, 0.07, 0.12, 0.05, -0.5), a.body, 0.008, FUR);
    } else {
      p.fill(p.ellipse(0, 0, 0.07, 0.06, 0.05), a.body, 0.008, FUR);
    }
  }, { grain: 0.06 });
}

export type EarArt = { art: ReturnType<typeof painted>; pivot: [number, number]; base: [number, number] };

/** Ear for side sx (-1 left, 1 right). `base` is where it joins the head (sheet coords → world). */
export function earTex(a: Animal, sx: -1 | 1): EarArt {
  const upright = a.ears !== "floppy";
  const oy = upright ? -0.12 : 0.3; // painter y of the pivot inside the ear texture
  const L = (lx: number, ly: number): Pt => [lx * K, ly * K + oy];
  const base: [number, number] = a.ears === "floppy" ? at(sx * 50, 222) : at(sx * 50, a.ears === "round" ? 214 : 212);
  const art = painted(`ear-${a.id}-${sx}`, 0.5, upright ? 0.6 : 0.8, (p) => {
    if (a.ears === "round") {
      p.fill(p.ellipse(...L(sx * 4, 12), 22 * K, 22 * K, 0.04), a.ear, 0.006, FUR * 0.8);
    } else if (a.ears === "pointy") {
      const q = (x: number, y: number) => L(sx * (x - 50), y - 212);
      p.fill(p.bezier(q(74, 208), [
        [q(84, 244), q(76, 270), q(66, 272)],
        [q(48, 264), q(30, 238), q(26, 220)],
        [q(40, 214), q(60, 210), q(74, 208)],
      ], 14), a.ear, 0.006, FUR * 0.7);
    } else {
      const q = (x: number, y: number) => L(sx * (x - 50), y - 222);
      p.fill(p.bezier(q(54, 222), [
        [q(84, 220), q(96, 170), q(90, 118)],
        [q(86, 96), q(62, 92), q(54, 118)],
        [q(48, 150), q(44, 190), q(40, 214)],
        [q(44, 220), q(50, 222), q(54, 222)],
      ], 14), a.ear, 0.006, FUR * 0.8);
    }
    p.strands(60, 0.03);
  }, { grain: 0.06, mottle: 0.05 });
  return { art, pivot: [0, oy], base };
}

export function pawTex(a: Animal) {
  return painted(`paw-${a.id}`, 0.34, 0.2, (p) => {
    p.fill(p.ellipse(0, 0, 21 * K, 12 * K, 0.05), a.paw, 0.006, FUR * 0.45);
  });
}

export function eyeTex(closed: boolean) {
  return painted(closed ? "eye-closed" : "eye-dot", 0.12, 0.12, (p) => {
    if (closed) p.stroke([[-0.032, 0.004], [0, -0.006], [0.032, 0.004]], "#151213", 0.014);
    else p.blob(0, 0, 6.5 * K, 7.5 * K, "#151213", { fuzz: 0.003, wob: 0.03 });
  }, { grain: 0.02 });
}

export function noseTex(a: Animal) {
  return painted(`nose-${a.id}`, 0.16, 0.12, (p) => {
    p.blob(0, 0, a.noseW * K, a.noseW * 0.74 * K, "#151213", { fuzz: 0.003, wob: 0.04 });
  }, { grain: 0.02 });
}

export function zTex() {
  return painted("zzz", 0.2, 0.2, (p) => {
    p.stroke([[-0.05, 0.05], [0.05, 0.05], [-0.05, -0.05], [0.05, -0.05]], "#F6F1E6", 0.018);
  }, { grain: 0.02 });
}

export function shadowTex() {
  return painted("shadow", 1.4, 0.26, (p) => p.blob(0, 0, 0.6, 0.07, "#000000", { fuzz: 0.02, wob: 0.03 }), { grain: 0.15 });
}

/** The signature drink that sits beside each friend. Base of the cup is at painter y = -0.15. */
export function cupTex(a: Animal) {
  return painted(`cup-${a.cup}`, 0.5, 0.5, (p) => {
    const b = -0.15;
    if (a.cup === "matcha") {
      p.blob(0, b, 0.15, 0.025, "#F6F2EA");
      p.poly([[-0.085, b + 0.17], [0.085, b + 0.17], [0.07, b + 0.02], [-0.07, b + 0.02]], "#F6F2EA");
      p.stroke([[0.085, b + 0.14], [0.13, b + 0.12], [0.12, b + 0.07], [0.078, b + 0.06]], "#F6F2EA", 0.02);
      p.blob(0, b + 0.17, 0.08, 0.017, "#9DB86A", { fuzz: 0.004 });
    } else if (a.cup === "iced") {
      p.ctx.globalAlpha = 0.55;
      p.poly([[-0.08, b + 0.27], [0.08, b + 0.27], [0.062, b], [-0.062, b]], "#F2F5F4", { fuzz: 0 });
      p.ctx.globalAlpha = 1;
      p.poly([[-0.075, b + 0.18], [0.075, b + 0.18], [0.062, b], [-0.062, b]], "#A5714A", { fuzz: 0.004 });
      p.poly([[-0.077, b + 0.215], [0.077, b + 0.215], [0.075, b + 0.17], [-0.075, b + 0.17]], "#E2C29C", { fuzz: 0.004 });
      p.poly([[-0.071, b + 0.13], [0.071, b + 0.13], [0.066, b + 0.06], [-0.066, b + 0.06]], "#C9A27A", { fuzz: 0.004 });
      p.blob(0, b + 0.275, 0.092, 0.012, "#F7F7F4", { fuzz: 0.003 });
      p.blob(0, b + 0.29, 0.07, 0.03, "#F7F7F4", { fuzz: 0.003 });
      p.stroke([[0.02, b + 0.29], [0.06, b + 0.42]], "#F6F2EA", 0.016);
    } else {
      p.poly([[-0.09, b + 0.17], [0.09, b + 0.17], [0.085, b + 0.01], [-0.085, b + 0.01]], "#C8332B");
      p.stroke([[0.09, b + 0.13], [0.135, b + 0.12], [0.13, b + 0.06], [0.087, b + 0.05]], "#C8332B", 0.024);
      p.blob(0, b + 0.17, 0.088, 0.018, "#5A3424", { fuzz: 0.004 });
      p.blob(-0.03, b + 0.18, 0.018, 0.012, "#FBF8F1", { fuzz: 0.003 });
      p.blob(0.025, b + 0.183, 0.016, 0.011, "#FBF8F1", { fuzz: 0.003 });
    }
  }, { grain: 0.05 });
}
