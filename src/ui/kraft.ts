// Kraft paper, painted once on a canvas: a warm tan base, soft mottling, fine light and dark
// fibres, grain and a few dark specks. Tiles seamlessly (everything near an edge is drawn
// again on the other side).

const SIZE = 512;
let cached: string | null = null;

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function kraftURL(): string {
  if (cached) return cached;
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const r = seeded(11);
  const wrap = (fn: (dx: number, dy: number) => void) => {
    for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) fn(dx, dy);
  };

  ctx.fillStyle = "#BE9068";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // soft mottling: big blurry patches a touch lighter or darker
  for (let i = 0; i < 70; i++) {
    const x = r() * SIZE, y = r() * SIZE, rad = 30 + r() * 90;
    const light = r() < 0.5;
    const a = 0.04 + r() * 0.06;
    wrap((dx, dy) => {
      const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
      g.addColorStop(0, light ? `rgba(226,186,146,${a})` : `rgba(140,96,60,${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2);
    });
  }

  // fibres: short, thin, gently curving hairs, mostly light, some darker
  ctx.lineCap = "round";
  for (let i = 0; i < 520; i++) {
    const x = r() * SIZE, y = r() * SIZE;
    const ang = r() * Math.PI * 2;
    const len = 8 + r() * 34;
    const bend = (r() - 0.5) * len * 0.8;
    const light = r() < 0.72;
    ctx.strokeStyle = light ? `rgba(236,204,170,${0.08 + r() * 0.16})` : `rgba(110,74,44,${0.08 + r() * 0.14})`;
    ctx.lineWidth = 0.5 + r() * 0.8;
    const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
    const cx = ex / 2 - Math.sin(ang) * bend, cy = ey / 2 + Math.cos(ang) * bend;
    wrap((dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.quadraticCurveTo(x + dx + cx, y + dy + cy, x + dx + ex, y + dy + ey);
      ctx.stroke();
    });
  }

  // fine grain
  const img = ctx.getImageData(0, 0, SIZE, SIZE);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 16;
    d[i] += n;
    d[i + 1] += n * 0.9;
    d[i + 2] += n * 0.8;
  }
  ctx.putImageData(img, 0, 0);

  // a few dark specks
  for (let i = 0; i < 9; i++) {
    const x = r() * SIZE, y = r() * SIZE, rad = 0.8 + r() * 1.6;
    ctx.fillStyle = `rgba(70,44,24,${0.4 + r() * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * (0.6 + r() * 0.6), r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  cached = c.toDataURL("image/jpeg", 0.88);
  return cached;
}
