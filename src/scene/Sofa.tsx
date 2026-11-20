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
  cup: [-0.95, -0.5], // on the grass in front of the sofa
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
  return painted("sofa-puffy2", W, H, (p: Painter) => {
    const opt = { wob: 0.01, fuzz: 0.01 };
    // two overstuffed back pillows that bulge over each other
    p.poly(cushion(-1.0, SEAT_TOP - 0.12, 0.08, 0.6, 0.24, 0.1), RED, opt);
    p.poly(cushion(-0.1, SEAT_TOP - 0.12, 1.0, 0.58, 0.24, 0.1), RED, opt);
    // a thick, rounded seat cushion
    p.poly(cushion(-1.06, SEAT_TOP - 0.26, 1.08, SEAT_TOP + 0.03, 0.14, 0.06), RED, opt);
    // base
    p.poly(cushion(-1.12, BASE, 1.14, SEAT_TOP - 0.18, 0.12, 0.02), RED, opt);
    // plump rolled arms
    p.poly(cushion(-1.26, BASE, -0.84, 0.18, 0.2, 0.08), RED, opt);
    p.poly(cushion(0.84, BASE, 1.26, 0.2, 0.2, 0.08), RED, opt);
    p.blob(-1.05, 0.15, 0.22, 0.12, RED, { wob: 0.03, fuzz: 0.01 });
    p.blob(1.05, 0.17, 0.22, 0.12, RED, { wob: 0.03, fuzz: 0.01 });

    // soft light on the tops of every cushion, soft shade where they tuck in
    // wide soft light along each cushion top, soft shade where cushions tuck in
    const lights: [number, number, number, number][] = [
      [-0.46, 0.44, 0.62, 0.32], [0.46, 0.42, 0.62, 0.32], [-0.5, SEAT_TOP - 0.03, 0.62, 0.22], [0.5, SEAT_TOP - 0.03, 0.62, 0.22],
      [-1.05, 0.2, 0.26, 0.6], [1.05, 0.22, 0.26, 0.6],
    ];
    for (const [x, y, r, sq] of lights) p.glow(x, y, r, LIGHT, 0.55, sq);
    const shades: [number, number, number, number][] = [
      [0.0, 0.1, 0.3, 1.4], [0, SEAT_TOP - 0.36, 1.1, 0.16], [0, SEAT_TOP + 0.04, 0.9, 0.08],
    ];
    for (const [x, y, r, sq] of shades) p.glow(x, y, r, DEEP, 0.5, sq);

    // a few soft fabric lines, much quieter than before
    const { ctx, rand: r } = p;
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.lineCap = "round";
    for (let i = 0; i < 45; i++) {
      const x = -1.2 + r() * 2.4;
      ctx.strokeStyle = r() < 0.6 ? LIGHT : DEEP;
      ctx.globalAlpha = 0.18 + r() * 0.18;
      ctx.lineWidth = (0.8 + r()) / p.ppu;
      ctx.beginPath();
      const y0 = BASE + r() * 0.3, y1 = 0.6 - r() * 0.3;
      ctx.moveTo(x, y0);
      ctx.bezierCurveTo(x + (r() - 0.5) * 0.05, y0 + 0.3, x + (r() - 0.5) * 0.05, y1 - 0.3, x + (r() - 0.5) * 0.04, y1);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    // where the pillows press into each other and the seat
    p.stroke([[0.02, SEAT_TOP + 0.08], [0.0, 0.25], [0.03, 0.5]], DEEP, 0.01);
    p.stroke([[-0.98, SEAT_TOP - 0.2], [-0.3, SEAT_TOP - 0.22], [0.3, SEAT_TOP - 0.22], [1.0, SEAT_TOP - 0.2]], DEEP, 0.008);
  }, { grain: 0.05, mottle: 0.05 });
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
