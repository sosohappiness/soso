import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { painted, seeded } from "../paint/painter";
import type { Growth } from "../lib/demo";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";

// 구름꽃: a billowy cloud floating over the meadow. Every gratitude line opens a small flower
// on it, and every 7 logged days a big flower blooms. Petals drift down now and then.
const X = -1.0;
const Y = 3.3;
const GROUND_Y = 0.5;

const PETAL_COLORS = ["#F4B6C2", "#F6D46A", "#F29A7E", "#C9B6E8"];

function cloudArt(base: string, shade: string) {
  return painted(`flower-cloud2-${base}-${shade}`, 3.2, 2.2, (p) => {
    const r = p.rand;
    // a round billowy crown of puffs over a soft body, with smaller bumps underneath
    const crown: [number, number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * (1.08 - (i / 8) * 1.16);
      crown.push([Math.cos(a) * 1.0, Math.sin(a) * 0.48 + 0.02, 0.3 + r() * 0.13 + (i > 2 && i < 6 ? 0.1 : 0)]);
    }
    const belly: [number, number, number][] = [-0.95, -0.55, -0.15, 0.25, 0.65, 1.0].map((x) => [x, -0.42 + r() * 0.04, 0.22 + r() * 0.06]);
    const all = [...crown, ...belly];
    p.fill(p.ellipse(0, -0.05, 1.12, 0.5, 0.03), base, 0.01, 0.008);
    for (const [x, y, rad] of all) p.fill(p.ellipse(x, y, rad, rad * 0.94, 0.03), base, 0.012, 0.01);
    // lavender underside fading up into white
    const { ctx } = p;
    const g = ctx.createLinearGradient(0, 0.05, 0, -0.75);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, shade);
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = g;
    ctx.fillRect(-1.6, -1.1, 3.2, 1.15);
    ctx.restore();
    // a soft lit top on every puff makes it read as 몽실몽실
    for (const [x, y, rad] of crown) p.glow(x - rad * 0.25, y + rad * 0.3, rad * 0.9, "#FFFFFF", 0.75);
    for (const [x, y, rad] of belly) p.glow(x, y + rad * 0.4, rad * 0.8, "#FFFFFF", 0.35);
    p.strands(160, 0.035, "rgba(120,100,140,0.03)");
  }, { grain: 0.035, mottle: 0.04 });
}

function flowerArt(color: string) {
  return painted(`cloud-flower-${color}`, 0.32, 0.32, (p) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      p.blob(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0.048, 0.04, color, { fuzz: 0.006, rot: a });
    }
    p.blob(0, 0, 0.026, 0.026, "#F9E7A8", { fuzz: 0.004 });
  }, { grain: 0.03 });
}

function petalArt() {
  return painted("cloud-petal", 0.14, 0.1, (p) => p.blob(0, 0, 0.04, 0.022, "#F4B6C2", { fuzz: 0.006 }), { grain: 0.03 });
}

function sparkleArt() {
  return painted("sparkle", 0.1, 0.1, (p) => p.blob(0, 0, 0.016, 0.016, "#FFF6D8", { fuzz: 0.008 }), { grain: 0.01 });
}

function shadowArt() {
  return painted("cloud-shadow", 2.6, 0.3, (p) => p.blob(0, 0, 1.15, 0.07, "#000", { fuzz: 0.03 }), { grain: 0.12 });
}

// Where the big (7-day) flowers bloom, in cloud space, in order.
const SPOTS: [number, number][] = [
  [-0.3, 0.55], [0.55, 0.32], [-0.85, 0.1], [0.2, 0.0], [0.95, -0.1], [-0.5, -0.25], [0.1, 0.72],
  [-1.1, -0.3], [0.6, -0.35], [-0.1, 0.35], [1.15, -0.4], [-0.75, 0.45], [0.4, 0.62], [-0.2, -0.4],
];

const MAX_SMALL = 36;
const PETALS = 4;
const SPARKLES = 12;

export function cloudScale(g: Growth) {
  // a small cloud at first; full size around 90 flowers (about a month of gratitude)
  return 0.8 + 0.2 * Math.min(1, g.flowers / 90);
}

export function CloudFlower({ pal, growth, night }: { pal: Palette; growth: Growth; night: boolean }) {
  const base = pal.cloud ?? "#FFF9F1";
  const shade = pal.cloudShade ?? "#E6DDEA";
  const cloud = useMemo(() => cloudArt(base, shade), [base, shade]);
  const flowers = useMemo(() => PETAL_COLORS.map(flowerArt), []);
  const petal = useMemo(petalArt, []);
  const sparkle = useMemo(sparkleArt, []);
  const shadow = useMemo(shadowArt, []);

  const s = cloudScale(growth);
  // small flowers: one per gratitude line, scattered over the cloud from the very first day
  const small = useMemo(() => {
    const r = seeded(7);
    const out: { x: number; y: number; rot: number; k: number; c: number }[] = [];
    let tries = 0;
    while (out.length < MAX_SMALL && tries++ < 4000) {
      const x = (r() - 0.5) * 2.4, y = (r() - 0.42) * 1.25;
      if ((x / 1.2) ** 2 + ((y - 0.05) / 0.6) ** 2 > 1) continue;
      if (out.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < 0.03)) continue;
      out.push({ x, y, rot: r() * 6.28, k: 0.38 + r() * 0.16, c: Math.floor(r() * PETAL_COLORS.length) });
    }
    return out;
  }, []);
  const smallCount = Math.min(small.length, growth.flowers);
  const bigCount = Math.min(SPOTS.length, growth.bigFlowers);

  const float = useRef<THREE.Group>(null);
  const petalRefs = useRef<(THREE.Group | null)[]>([]);
  const sparkRefs = useRef<(THREE.Group | null)[]>([]);
  const sparkSeeds = useMemo(() => {
    const r = seeded(19);
    return Array.from({ length: SPARKLES }, () => ({ x: (r() - 0.5) * 3.2, y: r() * 2.2 - 0.6, sp: 0.06 + r() * 0.08, ph: r() * 10 }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (float.current) {
      float.current.position.y = Y + Math.sin(t * 0.5) * 0.06;
      float.current.rotation.z = Math.sin(t * 0.3) * 0.012;
      // a slow breathing puff, so the cloud feels soft
      const b = 1 + Math.sin(t * 0.7) * 0.012;
      float.current.scale.set(b, 2 - b, 1);
    }
    petalRefs.current.forEach((g, i) => {
      if (!g) return;
      if (smallCount === 0) {
        g.visible = false;
        return;
      }
      const cyc = (t / 9 + i / PETALS) % 1;
      const f = small[(i * 5 + Math.floor(t / 9 + i / PETALS)) % smallCount];
      const startY = Y + f.y * s;
      g.visible = true;
      g.position.set(X + f.x * s + Math.sin(cyc * 9 + i) * 0.18 + cyc * 0.5, startY - cyc * (startY - GROUND_Y), Z.tree + 0.4);
      g.rotation.z = cyc * 6 + i;
      const m = (g.children[0] as THREE.Mesh | undefined)?.material as THREE.MeshBasicMaterial | undefined;
      if (m) m.opacity = Math.min(1, cyc * 8) * Math.min(1, (1 - cyc) * 4);
    });
    sparkRefs.current.forEach((g, i) => {
      if (!g) return;
      const sd = sparkSeeds[i];
      const y = ((sd.y + t * sd.sp) % 2.6) - 0.6;
      g.position.set(X + sd.x + Math.sin(t * 0.4 + sd.ph) * 0.12, Y + y, Z.tree + 0.3);
      g.scale.setScalar((night ? 1.2 : 0.9) * (0.6 + 0.4 * Math.sin(t * 1.7 + sd.ph)));
    });
  });

  return (
    <group>
      <Sprite art={shadow} position={[X + 0.05, GROUND_Y, Z.tree - 0.05]} scale={[s, 1, 1]} color="#000" opacity={pal.shadow * 0.55} order={11} />
      <group ref={float} position={[X, Y, Z.tree]}>
        <group scale={s}>
          <Sprite art={cloud} color={pal.tint} order={12} />
          {small.slice(0, smallCount).map((f, i) => (
            <group key={i} position={[f.x, f.y, 0.01]} rotation={[0, 0, f.rot]} scale={f.k}>
              <Sprite art={flowers[f.c]} color={pal.tint} order={13} />
            </group>
          ))}
          {SPOTS.slice(0, bigCount).map(([x, y], i) => (
            <Sprite key={i} art={flowers[i % flowers.length]} position={[x, y, 0.02]} scale={1 + ((i * 37) % 5) * 0.07} color={pal.tint} order={14} />
          ))}
        </group>
      </group>
      {Array.from({ length: PETALS }, (_, i) => (
        <Sprite key={`p${i}`} ref={(g) => { petalRefs.current[i] = g; }} art={petal} color={pal.tint} order={15} visible={false} />
      ))}
      {sparkSeeds.map((_, i) => (
        <Sprite key={`s${i}`} ref={(g) => { sparkRefs.current[i] = g; }} art={sparkle} opacity={night ? 0.9 : 0.6} order={16} />
      ))}
    </group>
  );
}
