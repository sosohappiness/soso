import { useMemo } from "react";
import { painted, type Painter, type Pt } from "../paint/painter";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import type { Seat } from "./Minimi";

// A big, soft red sofa standing in the meadow. Its seat is where Minimi sits.
const SOFA_X = 0.62;
const GROUND = 0.06;
const W = 2.5, H = 1.5;
const BASE = -0.66;    // painter y of the sofa's feet inside its texture
const SEAT_TOP = -0.08; // painter y of the seat cushion top

export const SOFA_SEAT: Seat = {
  x: SOFA_X - 0.12,
  y: GROUND + (SEAT_TOP - BASE) - 0.02,
  cup: [0.98, 0.33], // on the right arm
  shadow: false,
};

const RED = "#B3261E", DEEP = "#8F1D17", LIGHT = "#C8402F";

/** Points around a soft rounded rectangle with a slightly bulging top, like a stuffed cushion. */
function cushion(x0: number, y0: number, x1: number, y1: number, r: number, bulge = 0.03): Pt[] {
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  for (let i = 1; i < 8; i++) pts.push([x1 + Math.sin((i / 8) * Math.PI) * bulge * 0.5, y0 + r + ((y1 - y0 - 2 * r) * i) / 8]);
  corner(x1 - r, y1 - r, 0);
  for (let i = 1; i < 10; i++) pts.push([x1 - r - ((x1 - x0 - 2 * r) * i) / 10, y1 + Math.sin((i / 10) * Math.PI) * bulge]);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return pts;
}

function sofaArt() {
  return painted("sofa", W, H, (p: Painter) => {
    const opt = { wob: 0.006, fuzz: 0.008 };
    // back cushions
    p.poly(cushion(-1.0, SEAT_TOP - 0.1, 0.02, 0.62, 0.12, 0.05), RED, opt);
    p.poly(cushion(-0.06, SEAT_TOP - 0.1, 1.0, 0.6, 0.12, 0.05), RED, opt);
    // seat and base
    p.poly(cushion(-1.1, BASE, 1.12, SEAT_TOP, 0.1, 0.035), RED, opt);
    // arms
    p.poly(cushion(-1.22, BASE, -0.86, 0.22, 0.12, 0.04), RED, opt);
    p.poly(cushion(0.86, BASE, 1.22, 0.24, 0.12, 0.04), RED, opt);
    // pencil-like stripes running down the fabric, kept inside the sofa
    const { ctx, rand: r } = p;
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.lineCap = "round";
    for (let i = 0; i < 70; i++) {
      const x = -1.2 + r() * 2.4;
      ctx.strokeStyle = r() < 0.6 ? LIGHT : DEEP;
      ctx.globalAlpha = 0.35 + r() * 0.35;
      ctx.lineWidth = (0.8 + r() * 1.2) / p.ppu;
      ctx.beginPath();
      const y0 = BASE + r() * 0.3, y1 = 0.62 - r() * 0.3;
      ctx.moveTo(x, y0);
      ctx.bezierCurveTo(x + (r() - 0.5) * 0.04, y0 + 0.3, x + (r() - 0.5) * 0.04, y1 - 0.3, x + (r() - 0.5) * 0.03, y1);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    // seams between cushions, drawn as soft dark brush lines
    p.stroke([[-0.04, SEAT_TOP + 0.02], [-0.03, 0.3], [-0.02, 0.56]], DEEP, 0.012);
    p.stroke([[-1.06, SEAT_TOP], [-0.4, SEAT_TOP + 0.015], [0.4, SEAT_TOP + 0.01], [1.08, SEAT_TOP]], DEEP, 0.012);
    p.stroke([[-1.0, BASE + 0.26], [0, BASE + 0.25], [1.0, BASE + 0.26]], DEEP, 0.009);
  }, { grain: 0.06, mottle: 0.06 });
}

function sofaShadow() {
  return painted("sofa-shadow", 2.8, 0.3, (p) => p.blob(0, 0, 1.3, 0.08, "#000", { fuzz: 0.02 }), { grain: 0.15 });
}

export function Sofa({ pal }: { pal: Palette }) {
  const art = useMemo(sofaArt, []);
  const shadow = useMemo(sofaShadow, []);
  return (
    <group>
      <Sprite art={shadow} position={[SOFA_X + 0.05, GROUND + 0.02, Z.minimi - 0.2]} color="#000" opacity={pal.shadow} order={18} />
      <Sprite art={art} position={[SOFA_X, GROUND - BASE, Z.minimi - 0.15]} color={pal.tint} order={19} />
    </group>
  );
}
