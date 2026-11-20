// The gift friend: a brown squirrel with a huge striped tail that carries a teapot with its
// tail tip. Drawn in squirrel space: x to the right, y up from the feet, facing left (toward Minimi).
import { painted, type Painter, type Pt } from "../paint/painter";

const BROWN = "#9A6440";
const BELLY = "#E6CDA8";
const STRIPE = "#4A2E1F";
const FUR = 0.025;

// body texture: 1.0 × 1.1, feet at painter y = -0.5
export const SQ_BODY = { w: 1.0, h: 1.1, feetY: -0.5 };
const F = (x: number, y: number): Pt => [x, y + SQ_BODY.feetY];

// tail texture: 1.2 × 1.7, placed at squirrel (0.15, 0.78)
export const SQ_TAIL = { w: 1.2, h: 1.7, at: [0.15, 0.78] as [number, number] };
const T = (x: number, y: number): Pt => [x - SQ_TAIL.at[0], y - SQ_TAIL.at[1]];

/** Where the tail tip holds the teapot handle, in squirrel space. */
export const TAIL_TIP: [number, number] = [-0.1, 1.3];
/** Where the front paws hold the cup or gift, in squirrel space. */
export const PAWS_AT: [number, number] = [-0.36, 0.36];

export function squirrelBodyTex() {
  return painted("squirrel-body", SQ_BODY.w, SQ_BODY.h, (p: Painter) => {
    p.fill(p.ellipse(...F(0.1, 0.16), 0.19, 0.16, 0.04), BROWN, 0.008, FUR);   // haunch
    p.fill(p.ellipse(...F(0.0, 0.3), 0.23, 0.29, 0.03), BROWN, 0.008, FUR);    // body
    p.fill(p.ellipse(...F(-0.1, 0.62), 0.19, 0.17, 0.03), BROWN, 0.008, FUR);  // head
    p.fill(p.ellipse(...F(-0.26, 0.58), 0.1, 0.075, 0.04), BROWN, 0.008, FUR * 0.6); // snout
    p.poly([F(-0.06, 0.74), F(0.06, 0.74), F(0.01, 0.88)], BROWN, { wob: 0.006, fur: FUR * 0.6 });   // ear
    p.fill(p.ellipse(...F(-0.11, 0.3), 0.1, 0.17, 0.04), BELLY, 0.006, FUR * 0.35); // belly
    p.fill(p.ellipse(...F(-0.09, 0.025), 0.11, 0.04, 0.05), "#7E4F31", 0.006, FUR * 0.4); // foot
    // arm reaching forward to hold things
    p.fill(p.ellipse(...F(-0.24, 0.4), 0.12, 0.055, 0.05, -0.15), BROWN, 0.006, FUR * 0.5);
    // a little stripe on the hip, like the tail
    p.stroke([F(0.02, 0.22), F(0.12, 0.27), F(0.2, 0.2)], STRIPE, 0.016);
    // face: dot eyes and a nose, no mouth
    p.blob(...F(-0.2, 0.665), 0.019, 0.022, "#151213", { fuzz: 0.003 });
    p.blob(-0.12, 0.67 + SQ_BODY.feetY, 0.019, 0.022, "#151213", { fuzz: 0.003 });
    p.blob(...F(-0.345, 0.6), 0.032, 0.024, "#3B2B2E", { fuzz: 0.003 });
    p.strands(400, 0.03);
  }, { grain: 0.06, mottle: 0.05 });
}

export function squirrelPawTex() {
  return painted("squirrel-paw", 0.2, 0.14, (p) => p.fill(p.ellipse(0, 0, 0.045, 0.035, 0.05), "#7E4F31", 0.004, FUR * 0.35));
}

/** The big S-shaped plume: thin at the base, fat in the middle, curling forward at the tip. */
export function squirrelTailTex() {
  return painted("squirrel-tail", SQ_TAIL.w, SQ_TAIL.h, (p) => {
    const path = [
      ...p.bezier(T(0.18, 0.12), [[T(0.62, 0.3), T(0.66, 0.92), T(0.38, 1.22)]], 30),
      ...p.bezier(T(0.38, 1.22), [[T(0.2, 1.42), T(-0.02, 1.44), TAIL_TIP_T()]], 22),
    ];
    const n = path.length;
    const radius = (u: number) => 0.07 + 0.15 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + (u > 0.85 ? -0.02 : 0);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const r = Math.max(0.06, radius(u));
      p.fill(p.ellipse(path[i][0], path[i][1], r, r * 0.92, 0.05), BROWN, 0.008, FUR);
    }
    // two dark stripes running along the plume
    for (const side of [-0.4, 0.28]) {
      const stripe: Pt[] = [];
      for (let i = Math.floor(n * 0.12); i < Math.floor(n * 0.86); i++) {
        const [x0, y0] = path[Math.max(0, i - 1)], [x1, y1] = path[Math.min(n - 1, i + 1)];
        const len = Math.hypot(x1 - x0, y1 - y0) || 1;
        const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
        const r = radius(i / (n - 1)) * side;
        stripe.push([path[i][0] + nx * r, path[i][1] + ny * r]);
      }
      p.stroke(stripe, STRIPE, 0.022);
    }
    p.strands(500, 0.035);
  }, { grain: 0.06, mottle: 0.05 });
}

function TAIL_TIP_T(): Pt {
  return T(TAIL_TIP[0], TAIL_TIP[1]);
}

/** Teapot: cream with a blue band. The pivot (where the tail grips the handle) is at (0.15, 0.06). */
export const TEAPOT_PIVOT: [number, number] = [0.15, 0.06];
/** Spout tip relative to the pivot. */
export const SPOUT_FROM_PIVOT: [number, number] = [-0.38, 0.0];

export function teapotTex() {
  return painted("teapot", 0.56, 0.4, (p) => {
    const cream = "#F4EEE1";
    p.poly([[-0.11, 0.0], [-0.2, 0.04], [-0.235, 0.075], [-0.215, 0.085], [-0.18, 0.06], [-0.1, 0.04]], cream, { wob: 0.003, fuzz: 0.003 });
    p.fill(p.ellipse(0, 0, 0.13, 0.1, 0.03), cream, 0.005);
    p.fill(p.ellipse(0, 0.095, 0.075, 0.025, 0.03), cream, 0.004);
    p.blob(0, 0.13, 0.022, 0.018, cream, { fuzz: 0.003 });
    const ring: Pt[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = -Math.PI / 2 + (i / 16) * Math.PI;
      ring.push([0.12 + Math.cos(a) * 0.05, 0.01 + Math.sin(a) * 0.06]);
    }
    p.stroke(ring, cream, 0.018);
    p.stroke([[-0.125, 0.0], [0, -0.012], [0.125, 0.0]], "#5B7FC0", 0.016);
    p.blob(0.0, 0.095, 0.03, 0.008, "#5B7FC0", { fuzz: 0.002 });
  }, { grain: 0.04 });
}

export function streamTex() {
  return painted("tea-stream2", 0.05, 1.0, (p) => {
    p.poly([[-0.014, 0.5], [0.014, 0.5], [0.011, -0.5], [-0.011, -0.5]], "#9DB86A", { wob: 0.002, fuzz: 0 });
  }, { grain: 0.02 });
}

/** The same cup as the matcha latte, but empty (before the tea is poured). */
export function emptyCupTex() {
  return painted("cup-empty", 0.5, 0.5, (p) => {
    const b = -0.15;
    p.blob(0, b, 0.15, 0.025, "#F6F2EA");
    p.poly([[-0.085, b + 0.17], [0.085, b + 0.17], [0.07, b + 0.02], [-0.07, b + 0.02]], "#F6F2EA");
    p.stroke([[0.085, b + 0.14], [0.13, b + 0.12], [0.12, b + 0.07], [0.078, b + 0.06]], "#F6F2EA", 0.02);
    p.blob(0, b + 0.17, 0.08, 0.017, "#E3DCD0", { fuzz: 0.004 });
  }, { grain: 0.05 });
}
