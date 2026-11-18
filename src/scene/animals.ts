// One shared lying-down body; each animal only swaps colours, head markings, ears and tail.
import { painted, type Painter } from "../paint/painter";

export type AnimalId = "polar" | "redpanda" | "dog";

export type Animal = {
  id: AnimalId;
  name: string;
  body: string;
  belly: string;
  paw: string;
  ear: string;
  earInner: string;
  nose: string;
  ears: "round" | "pointy" | "floppy";
  tail: "stub" | "striped" | "curl";
};

export const ANIMALS: Record<AnimalId, Animal> = {
  polar: {
    id: "polar", name: "북극곰",
    body: "#F6F1E6", belly: "#EAE3D6", paw: "#F6F1E6",
    ear: "#F6F1E6", earInner: "#E3D7C6", nose: "#25222A",
    ears: "round", tail: "stub",
  },
  redpanda: {
    id: "redpanda", name: "레서판다",
    body: "#DE7D43", belly: "#3C2C30", paw: "#3C2C30",
    ear: "#DE7D43", earInner: "#F5E6CF", nose: "#25222A",
    ears: "pointy", tail: "striped",
  },
  dog: {
    id: "dog", name: "강아지",
    body: "#D79E62", belly: "#F4E7D1", paw: "#F4E7D1",
    ear: "#8C5B37", earInner: "#8C5B37", nose: "#25222A",
    ears: "floppy", tail: "curl",
  },
};

export function animalFromSearch(search: string): AnimalId | null {
  const a = new URLSearchParams(search).get("animal");
  return a && a in ANIMALS ? (a as AnimalId) : null;
}

// ---- textures -------------------------------------------------------------

export const BODY = { w: 1.6, h: 0.9 };
export const HEAD = { w: 0.8, h: 0.72 };

export function bodyTex(a: Animal) {
  return painted(`body-${a.id}`, BODY.w, BODY.h, (p) => {
    // main loaf + haunch + hind foot, all one colour so they merge
    p.blob(0.02, -0.05, 0.62, 0.29, a.body, { wob: 0.02 });
    p.blob(0.36, 0.0, 0.3, 0.27, a.body, { wob: 0.03 });
    p.blob(0.52, -0.25, 0.14, 0.08, a.id === "redpanda" ? a.paw : a.body);
    if (a.id === "redpanda") {
      // dark legs/underside peeking out
      p.blob(-0.05, -0.27, 0.42, 0.07, a.belly, { wob: 0.04 });
    } else if (a.id === "dog") {
      p.blob(-0.18, -0.2, 0.34, 0.1, a.belly, { wob: 0.04 });
    } else {
      p.blob(0.36, -0.02, 0.2, 0.16, a.belly, { wob: 0.05, fuzz: 0.008 });
      p.blob(0.36, 0.02, 0.18, 0.15, a.body, { wob: 0.05, fuzz: 0.008 });
    }
  });
}

export function pawTex(a: Animal) {
  return painted(`paw-${a.id}`, 0.4, 0.22, (p) => {
    p.blob(0, 0, 0.16, 0.075, a.paw);
  });
}

export function headTex(a: Animal) {
  return painted(`head-${a.id}`, HEAD.w, HEAD.h, (p) => {
    p.blob(0, 0, 0.3, 0.26, a.body, { wob: 0.02 });
    if (a.id === "redpanda") {
      // cream mask: cheeks, eyebrows, muzzle
      p.blob(-0.17, -0.09, 0.1, 0.08, a.earInner, { rot: 0.4 });
      p.blob(0.17, -0.09, 0.1, 0.08, a.earInner, { rot: -0.4 });
      p.blob(-0.11, 0.11, 0.045, 0.03, a.earInner);
      p.blob(0.11, 0.11, 0.045, 0.03, a.earInner);
      p.blob(0, -0.12, 0.1, 0.07, a.earInner);
    } else if (a.id === "dog") {
      p.blob(0, -0.11, 0.14, 0.1, a.belly);
      p.poly([[-0.03, 0.24], [0.03, 0.24], [0.05, -0.04], [-0.05, -0.04]], a.belly, { fuzz: 0.008 });
    } else {
      p.blob(0, -0.11, 0.12, 0.085, "#FBF8F1");
    }
    p.blob(0, -0.075, 0.04, 0.028, a.nose, { fuzz: 0.004 });
  });
}

export function earTex(a: Animal) {
  return painted(`ear-${a.id}`, 0.3, 0.36, (p: Painter) => {
    if (a.ears === "round") {
      p.blob(0, 0, 0.085, 0.08, a.ear);
      p.blob(0, -0.01, 0.045, 0.04, a.earInner, { fuzz: 0.006 });
    } else if (a.ears === "pointy") {
      p.poly([[-0.11, -0.1], [0.11, -0.1], [0.04, 0.14], [-0.02, 0.15]], a.ear, { wob: 0.01 });
      p.poly([[-0.06, -0.06], [0.06, -0.06], [0.02, 0.08], [-0.01, 0.09]], a.earInner, { wob: 0.008, fuzz: 0.006 });
    } else {
      // floppy: a long drop hanging down
      p.blob(0, -0.04, 0.075, 0.15, a.ear, { wob: 0.03 });
    }
  });
}

export function tailTex(a: Animal) {
  return painted(`tail-${a.id}`, 0.8, 0.6, (p) => {
    if (a.tail === "stub") {
      p.blob(0.0, 0.0, 0.08, 0.07, a.body);
    } else if (a.tail === "striped") {
      // long bushy tail curling up behind the body
      const pts: [number, number][] = [];
      for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        pts.push([-0.25 + t * 0.5, -0.12 + Math.sin(t * 2.4) * 0.16]);
      }
      pts.forEach(([x, y], i) => p.blob(x, y, 0.12 - i * 0.005, 0.1, i % 2 ? "#A9512A" : a.body, { wob: 0.04 }));
    } else {
      p.blob(0.0, 0.04, 0.1, 0.13, a.body, { rot: -0.5 });
      p.blob(-0.04, 0.08, 0.05, 0.06, a.belly, { rot: -0.5, fuzz: 0.006 });
    }
  });
}

export function eyeTex(closed: boolean) {
  return painted(closed ? "eye-closed" : "eye-open", 0.12, 0.12, (p) => {
    if (closed) p.stroke([[-0.035, 0.005], [0, -0.012], [0.035, 0.005]], "#25222A", 0.016);
    else p.blob(0, 0, 0.026, 0.03, "#25222A", { fuzz: 0.004 });
  }, { grain: 0.02 });
}

export function cheekTex() {
  return painted("cheek", 0.14, 0.1, (p) => p.blob(0, 0, 0.045, 0.03, "#F0A08A", { fuzz: 0.01 }), { grain: 0.03 });
}

export function zTex() {
  return painted("zzz", 0.2, 0.2, (p) => {
    p.stroke([[-0.05, 0.05], [0.05, 0.05], [-0.05, -0.05], [0.05, -0.05]], "#F6F1E6", 0.018);
  }, { grain: 0.02 });
}

export function shadowTex() {
  return painted("shadow", 1.9, 0.3, (p) => p.blob(0, 0, 0.88, 0.09, "#000000", { fuzz: 0.02, wob: 0.03 }), { grain: 0.15 });
}
