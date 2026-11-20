// Gouache-style painter: draws flat shapes with wobbly, fuzzy edges and paper grain
// onto a canvas, in world units (origin at canvas centre, y up). The canvas then becomes
// a texture on a flat cutout in the 3D diorama.
import * as THREE from "three";

export type Pt = [number, number];
export type Rand = () => number;

export const PPU = 200; // canvas pixels per world unit

export function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Painter {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly rand: Rand;
  private edges: { pts: Pt[]; color: string; amt: number; fur: number }[] = [];

  constructor(readonly w: number, readonly h: number, seed = 1, readonly ppu = PPU) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Math.max(4, Math.round(w * ppu));
    this.canvas.height = Math.max(4, Math.round(h * ppu));
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2D canvas is not available");
    this.ctx = ctx;
    this.rand = seeded(seed);
    ctx.setTransform(ppu, 0, 0, -ppu, this.canvas.width / 2, this.canvas.height / 2);
  }

  /** Points around an ellipse with a low-frequency hand-painted wobble. */
  ellipse(cx: number, cy: number, rx: number, ry: number, wob = 0.025, rot = 0): Pt[] {
    const r = this.rand;
    const n = Math.max(24, Math.round((rx + ry) * this.ppu * 0.35));
    const f = [r() * 6.28, r() * 6.28, r() * 6.28];
    const pts: Pt[] = [];
    const c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const k = 1 + wob * (0.6 * Math.sin(2 * t + f[0]) + 0.3 * Math.sin(3 * t + f[1]) + 0.25 * Math.sin(5 * t + f[2])) + (r() - 0.5) * wob * 0.25;
      const x = Math.cos(t) * rx * k, y = Math.sin(t) * ry * k;
      pts.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
    return pts;
  }

  /** Subdivide a polyline/polygon and jitter it so straight edges look brushed. */
  wobbly(points: Pt[], closed = true, wob = 0.008, step = 0.02): Pt[] {
    const out: Pt[] = [];
    const n = points.length;
    const segs = closed ? n : n - 1;
    let phase = this.rand() * 10;
    for (let i = 0; i < segs; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % n];
      const len = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.round(len / step));
      const nx = -(y1 - y0) / (len || 1), ny = (x1 - x0) / (len || 1);
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        phase += 0.35;
        const d = (Math.sin(phase) * 0.6 + (this.rand() - 0.5) * 0.8) * wob;
        out.push([x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d]);
      }
    }
    if (!closed) out.push(points[n - 1]);
    return out;
  }

  /** Fill a shape. Its edge gets fuzzed in finish(), after every fill is down. */
  fill(pts: Pt[], color: string, fuzz = 0.012, fur = 0): Pt[] {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
    if (fuzz > 0 || fur > 0) this.edges.push({ pts, color, amt: fuzz, fur });
    return pts;
  }

  blob(cx: number, cy: number, rx: number, ry: number, color: string, opts: { wob?: number; fuzz?: number; rot?: number } = {}) {
    return this.fill(this.ellipse(cx, cy, rx, ry, opts.wob ?? 0.025, opts.rot ?? 0), color, opts.fuzz ?? 0.012);
  }

  poly(points: Pt[], color: string, opts: { wob?: number; fuzz?: number; fur?: number } = {}) {
    return this.fill(this.wobbly(points, true, opts.wob ?? 0.008), color, opts.fuzz ?? 0.012, opts.fur ?? 0);
  }

  /** Sample a closed path of cubic béziers: start point, then [c1, c2, end] per segment. */
  bezier(start: Pt, segs: [Pt, Pt, Pt][], steps = 20): Pt[] {
    const pts: Pt[] = [];
    let p0 = start;
    for (const [c1, c2, p3] of segs) {
      for (let i = 0; i < steps; i++) {
        const t = i / steps, u = 1 - t;
        pts.push([
          u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
          u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
        ]);
      }
      p0 = p3;
    }
    return pts;
  }

  /** Soft radial light (or shade) painted only on top of what is already there. */
  glow(x: number, y: number, r: number, color: string, alpha: number, squash = 1) {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(1, squash); // squash < 1 makes a wide, soft ellipse
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, color);
    g.addColorStop(0.45, color.length === 7 ? color + "99" : color);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  /** Faint hair strokes inside everything painted so far (fur texture, never outside the shapes). */
  strands(count: number, len: number, color = "rgba(0,0,0,0.06)") {
    const { ctx, rand: r, canvas, ppu } = this;
    const W = canvas.width / ppu, H = canvas.height / ppu;
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    for (let i = 0; i < count; i++) {
      const x = (r() - 0.5) * W, y = (r() - 0.5) * H;
      const a = Math.PI / 2 + (r() - 0.5) * 1.6;
      const l = len * (0.5 + r());
      ctx.lineWidth = (0.6 + r()) / ppu;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * l * 0.4, y - Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y - Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** A soft, slightly uneven brush stroke (for eyes, z's, petals' veins). */
  stroke(points: Pt[], color: string, width: number) {
    const { ctx } = this;
    const pts = this.wobbly(points, false, width * 0.12, width * 0.6);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }

  private fuzzEdges() {
    const { ctx, rand: r, ppu } = this;
    const px = 1 / ppu;
    for (const { pts, color, amt, fur } of this.edges) {
      // signed area tells us which side is "outside"
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
        area += x0 * y1 - x1 * y0;
      }
      const dir = area > 0 ? 1 : -1;
      ctx.fillStyle = color;
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
        const len = Math.hypot(x1 - x0, y1 - y0);
        if (len === 0) continue;
        const nx = ((y1 - y0) / len) * dir, ny = (-(x1 - x0) / len) * dir;
        const count = Math.ceil((len / px) * 0.9);
        for (let j = 0; j < count; j++) {
          const t = r();
          const out = (r() * 1.15 - 0.25) * amt;
          const rad = (0.5 + r() * 1.3) * px;
          ctx.globalAlpha = 0.35 + r() * 0.65;
          ctx.beginPath();
          ctx.arc(x0 + (x1 - x0) * t + nx * out, y0 + (y1 - y0) * t + ny * out, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        // frizzy fur: short curved hairs sticking out of the edge
        if (fur > 0) {
          ctx.strokeStyle = color;
          ctx.lineCap = "round";
          const hairs = Math.ceil((len / px) * 0.55);
          for (let j = 0; j < hairs; j++) {
            const t = r();
            const sx = x0 + (x1 - x0) * t - nx * fur * 0.35, sy = y0 + (y1 - y0) * t - ny * fur * 0.35;
            const ang = Math.atan2(ny, nx) + (r() - 0.5) * 1.3;
            const l = fur * (0.45 + r() * 0.9);
            const bend = (r() - 0.5) * l * 0.8;
            ctx.globalAlpha = 0.45 + r() * 0.55;
            ctx.lineWidth = (0.7 + r() * 1.1) * px;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(sx + Math.cos(ang) * l * 0.5 - Math.sin(ang) * bend, sy + Math.sin(ang) * l * 0.5 + Math.cos(ang) * bend, sx + Math.cos(ang) * l, sy + Math.sin(ang) * l);
            ctx.stroke();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    this.edges = [];
  }

  /** Paper grain: per-pixel speckle plus a soft mottle, like gouache on cold-press paper. */
  private grain(amount: number, mottle: number) {
    const { canvas, ctx, rand: r } = this;
    const W = canvas.width, H = canvas.height;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const cell = Math.max(8, Math.round(this.ppu * 0.35));
    const gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2;
    const grid = new Float32Array(gw * gh);
    for (let i = 0; i < grid.length; i++) grid[i] = r() - 0.5;
    for (let y = 0; y < H; y++) {
      const gy = y / cell, iy = Math.floor(gy), fy = gy - iy, sy = fy * fy * (3 - 2 * fy);
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i + 3] === 0) continue;
        const gx = x / cell, ix = Math.floor(gx), fx = gx - ix, sx = fx * fx * (3 - 2 * fx);
        const a = grid[iy * gw + ix], b = grid[iy * gw + ix + 1];
        const c = grid[(iy + 1) * gw + ix], e = grid[(iy + 1) * gw + ix + 1];
        const m = (a + (b - a) * sx) * (1 - sy) + (c + (e - c) * sx) * sy;
        const speck = r() - 0.5;
        const k = 1 + m * mottle + speck * amount * 1.6 + (r() < 0.01 ? amount * 2 : 0);
        d[i] = Math.min(255, d[i] * k);
        d[i + 1] = Math.min(255, d[i + 1] * k);
        d[i + 2] = Math.min(255, d[i + 2] * k);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /** A thin outline around the silhouette of everything painted (props and cups). */
  private outline(color: string, px: number) {
    const { canvas, ctx } = this;
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const t = tmp.getContext("2d");
    if (!t) return;
    t.drawImage(canvas, 0, 0);
    t.globalCompositeOperation = "source-in";
    t.fillStyle = color;
    t.fillRect(0, 0, tmp.width, tmp.height);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-over";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.drawImage(tmp, Math.cos(a) * px, Math.sin(a) * px);
    }
    ctx.restore();
  }

  finish(opts: { grain?: number; mottle?: number; outline?: string; outlinePx?: number } = {}): THREE.CanvasTexture {
    this.fuzzEdges();
    if (opts.outline) this.outline(opts.outline, opts.outlinePx ?? 2);
    this.grain(opts.grain ?? 0.07, opts.mottle ?? 0.05);
    const tex = new THREE.CanvasTexture(this.canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }
}

export type Painted = { tex: THREE.Texture; w: number; h: number };

const cache = new Map<string, Painted>();

/** Paint once per key and reuse. */
export function painted(key: string, w: number, h: number, draw: (p: Painter) => void, opts?: { grain?: number; mottle?: number; seed?: number; ppu?: number; outline?: string; outlinePx?: number }): Painted {
  const hit = cache.get(key);
  if (hit) return hit;
  let seed = opts?.seed ?? 0;
  if (!seed) for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) | 0;
  const p = new Painter(w, h, seed, opts?.ppu ?? PPU);
  draw(p);
  const out = { tex: p.finish(opts), w, h };
  cache.set(key, out);
  return out;
}
