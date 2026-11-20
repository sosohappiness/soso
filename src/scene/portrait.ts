// A still portrait of a friend, built from exactly the same painted pieces as the home screen
// (fluffy body, ears, dot eyes, nose, paws), so cards look just like the friend on the sofa.
import type { Painted } from "../paint/painter";
import { ANIMALS, BODY_TEX, FACE, at, bodyTex, earTex, eyeTex, noseTex, pawShadowTex, pawTex, type AnimalId } from "./animals";

const PPU = 140;          // portrait pixels per world unit
const W = 1.6, H = 1.75;  // world-size of the portrait
const TOP = 1.55;         // world y at the top edge (base of the body is y = 0)

const cache = new Map<AnimalId, string>();

function draw(ctx: CanvasRenderingContext2D, art: Painted, cx: number, cy: number, alpha = 1, rot = 0) {
  const img = art.tex.image as HTMLCanvasElement;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate((cx + W / 2) * PPU, (TOP - cy) * PPU);
  ctx.rotate(-rot);
  ctx.drawImage(img, (-art.w / 2) * PPU, (-art.h / 2) * PPU, art.w * PPU, art.h * PPU);
  ctx.restore();
}

/** PNG data URL of the friend sitting, as on the home screen in the daytime. */
export function portraitURL(id: AnimalId): string {
  const hit = cache.get(id);
  if (hit) return hit;
  const a = ANIMALS[id];
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * PPU);
  canvas.height = Math.round(H * PPU);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const ears = [earTex(a, -1), earTex(a, 1)];
  const floppy = a.ears === "floppy";
  const placeEar = (i: number) => {
    const e = ears[i];
    const sx = i === 0 ? -1 : 1;
    // the ear's pivot sits on its base point; the art's centre is offset from the pivot
    const out = floppy ? 0 : -0.06;
    const rot = floppy ? 0 : -sx * out;
    const [bx, by] = e.base;
    const dx = -e.pivot[0], dy = -e.pivot[1];
    const c = Math.cos(rot), s = Math.sin(rot);
    draw(ctx, e.art, bx + dx * c - dy * s, by + 0.012 + dx * s + dy * c, 1, rot);
  };

  if (!floppy) [0, 1].forEach(placeEar);
  draw(ctx, bodyTex(a), 0, -BODY_TEX.baseY);
  if (floppy) [0, 1].forEach(placeEar);
  const eye = eyeTex(false);
  draw(ctx, eye, FACE.eyeL[0], FACE.eyeL[1]);
  draw(ctx, eye, FACE.eyeR[0], FACE.eyeR[1]);
  draw(ctx, noseTex(a), FACE.nose[0], FACE.nose[1]);
  const shadow = pawShadowTex(), paw = pawTex(a);
  for (const [x, y] of [at(-34, 4), at(34, 4)]) {
    draw(ctx, shadow, x + 0.012, y - 0.03, 0.16);
    draw(ctx, paw, x, y);
  }
  const url = canvas.toDataURL("image/png");
  cache.set(id, url);
  return url;
}

/** Size of the portrait image, for layout (width / height). */
export const PORTRAIT_ASPECT = W / H;
