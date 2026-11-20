import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { painted, seeded, type Painter } from "../paint/painter";
import { Sprite } from "./Sprite";
import type { Palette } from "./palette";

// Small life in the grass: yellow dandelions, one white puffball that lets seeds go,
// and a snail that crawls along very, very slowly.

const STEM = "#5E8B45";
const LEAF = "#6F9A4E";

function stemAndLeaves(p: Painter, h: number, lean: number) {
  p.stroke([[0, -0.2], [lean * 0.4, -0.2 + h * 0.5], [lean, -0.2 + h]], STEM, 0.012);
  // a toothy dandelion leaf on each side at the base
  for (const sx of [-1, 1]) {
    const pts: [number, number][] = [[0, -0.2]];
    for (let i = 1; i <= 5; i++) {
      const t = i / 5;
      pts.push([sx * t * 0.16, -0.2 + t * 0.07 + (i % 2 ? 0.03 : 0)]);
    }
    pts.push([sx * 0.17, -0.19]);
    for (let i = 4; i >= 1; i--) pts.push([sx * (i / 5) * 0.16, -0.205 + (i / 5) * 0.02]);
    p.poly(pts, LEAF, { wob: 0.004, fuzz: 0.004 });
  }
}

function dandelionArt(h: number, lean: number) {
  return painted(`dandelion-${h}-${lean}`, 0.5, 0.7, (p) => {
    stemAndLeaves(p, h, lean);
    const top: [number, number] = [lean, -0.2 + h];
    // shaggy yellow head: fur strands are the little petals
    p.fill(p.ellipse(top[0], top[1], 0.055, 0.045, 0.06), "#F3C73A", 0.006, 0.03);
    p.fill(p.ellipse(top[0], top[1] + 0.005, 0.035, 0.028, 0.06), "#F8D95C", 0, 0.012);
  }, { grain: 0.04 });
}

function puffArt() {
  return painted("dandelion-puff", 0.5, 0.75, (p) => {
    stemAndLeaves(p, 0.42, -0.03);
    const [x, y] = [-0.03, 0.22];
    // a see-through ball of fine white seeds
    const { ctx, rand: r } = p;
    ctx.strokeStyle = "#FFFDF6";
    ctx.lineCap = "round";
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2;
      const l = 0.07 + r() * 0.02;
      ctx.globalAlpha = 0.5 + r() * 0.4;
      ctx.lineWidth = (0.6 + r() * 0.6) / p.ppu;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * l, y + Math.sin(a) * l, (1 + r()) / p.ppu, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFDF6";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    p.blob(x, y, 0.014, 0.014, "#C9B88E", { fuzz: 0.003 });
  }, { grain: 0.02 });
}

function seedArt() {
  return painted("dandelion-seed", 0.1, 0.1, (p) => {
    p.stroke([[0, -0.02], [0, 0.015]], "#FFFDF6", 0.003);
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.15 + (i / 6) * 0.7);
      p.stroke([[0, 0.015], [Math.cos(a) * 0.022, 0.015 + Math.sin(a) * 0.022]], "#FFFDF6", 0.002);
    }
  }, { grain: 0 });
}

function snailArt() {
  return painted("snail", 0.6, 0.45, (p) => {
    // soft body with a little neck lifted at the front (facing right)
    p.fill(p.bezier([-0.2, -0.12], [
      [[-0.1, -0.08], [0.1, -0.08], [0.15, -0.06]],
      [[0.19, -0.05], [0.2, 0.05], [0.17, 0.08]],
      [[0.14, 0.1], [0.11, 0.06], [0.1, 0.0]],
      [[0.05, -0.1], [-0.1, -0.12], [-0.2, -0.12]],
    ], 14), "#D8C9B4", 0.006, 0.004);
    // eye stalks with dot eyes
    p.stroke([[0.16, 0.07], [0.18, 0.15]], "#D8C9B4", 0.012);
    p.stroke([[0.14, 0.07], [0.13, 0.14]], "#D8C9B4", 0.011);
    p.blob(0.182, 0.155, 0.012, 0.012, "#151213", { fuzz: 0.002 });
    p.blob(0.13, 0.145, 0.011, 0.011, "#151213", { fuzz: 0.002 });
    // round shell with a painted spiral
    p.fill(p.ellipse(-0.04, 0.02, 0.12, 0.115, 0.03), "#E5A877", 0.006, 0.004);
    p.glow(-0.07, 0.07, 0.1, "#F2C69A", 0.7);
    const spiral: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const a = t * Math.PI * 3.6;
      const rr = 0.095 * (1 - t * 0.85);
      spiral.push([-0.04 + Math.cos(a) * rr, 0.02 + Math.sin(a) * rr * 0.95]);
    }
    p.stroke(spiral, "#B87648", 0.009);
  }, { grain: 0.04 });
}

const FLOWERS: { x: number; y: number; z: number; h: number; lean: number; s: number }[] = [
  { x: -1.75, y: 0.1, z: -0.4, h: 0.3, lean: 0.03, s: 1.45 },
  { x: -1.35, y: -0.12, z: -0.3, h: 0.24, lean: -0.04, s: 1.35 },
  { x: -0.8, y: 0.3, z: -0.6, h: 0.28, lean: 0.02, s: 1.2 },
  { x: 1.7, y: -0.32, z: 0.5, h: 0.32, lean: -0.03, s: 1.5 },
];
const PUFF = { x: -2.0, y: 0.0, z: -0.35 };
const SEEDS = 12;

export function MeadowLife({ pal }: { pal: Palette }) {
  const flowers = useMemo(() => FLOWERS.map((f) => dandelionArt(f.h, f.lean)), []);
  const puff = useMemo(puffArt, []);
  const seed = useMemo(seedArt, []);
  const snail = useMemo(snailArt, []);
  const snailRef = useRef<THREE.Group>(null);
  const flowerRefs = useRef<(THREE.Group | null)[]>([]);
  const seedRefs = useRef<(THREE.Group | null)[]>([]);
  const seedPaths = useMemo(() => {
    const r = seeded(41);
    // each seed rides the breeze across the whole meadow, rising and dipping, some higher than others
    return Array.from({ length: SEEDS }, () => ({ ph: r(), drift: 3.6 + r() * 1.6, rise: 0.5 + r() * 2.2, wob: r() * 6, speed: 12 + r() * 8, z: (r() - 0.5) * 1.2 }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // snail: about one screen width every few minutes, with a gentle inch-worm stretch
    if (snailRef.current) {
      const x = -1.8 + ((t * 0.012) % 1.7);
      const inch = 1 + Math.max(0, Math.sin(t * 1.6)) * 0.06;
      snailRef.current.position.x = x;
      snailRef.current.scale.set(inch, 2 - inch, 1);
    }
    // flowers sway in the breeze, with an occasional stronger gust passing through
    const gust = Math.max(0, Math.sin(t * 0.23)) ** 3 * 0.12;
    flowerRefs.current.forEach((g, i) => g && (g.rotation.z = Math.sin(t * 1.1 + i * 1.7) * 0.12 + Math.sin(t * 2.3 + i) * 0.03 - gust));
    // seeds lift off the puffball and drift away on the breeze, then start over
    seedRefs.current.forEach((g, i) => {
      if (!g) return;
      const sp = seedPaths[i];
      const cyc = (t / sp.speed + sp.ph) % 1;
      g.position.set(PUFF.x + cyc * sp.drift, PUFF.y + 0.6 + Math.sin(cyc * Math.PI) * sp.rise + Math.sin(cyc * 9 + sp.wob) * 0.12, PUFF.z + 0.4 + sp.z);
      g.rotation.z = Math.sin(cyc * 6 + sp.wob) * 0.5;
      g.scale.setScalar(1.3);
      const m = (g.children[0] as THREE.Mesh | undefined)?.material as THREE.MeshBasicMaterial | undefined;
      if (m) m.opacity = Math.min(1, cyc * 10) * Math.min(1, (1 - cyc) * 3);
    });
  });

  return (
    <group>
      {FLOWERS.map((f, i) => (
        // pivot at the stem base so the flower sways from the ground
        <group key={i} ref={(g) => { flowerRefs.current[i] = g; }} position={[f.x, f.y - 0.2 * f.s, f.z]} scale={f.s}>
          <Sprite art={flowers[i]} pivot={[0, -0.2]} color={pal.tint} order={17} />
        </group>
      ))}
      <group position={[PUFF.x, PUFF.y - 0.2 * 1.4, PUFF.z]} scale={1.4}>
        <Sprite art={puff} pivot={[0, -0.2]} color={pal.tint} order={17} />
      </group>
      {seedPaths.map((_, i) => (
        <Sprite key={i} ref={(g) => { seedRefs.current[i] = g; }} art={seed} color={pal.tint} order={17} />
      ))}
      <group ref={snailRef} position={[-1.8, -0.6, 0.7]}>
        <Sprite art={snail} pivot={[0, -0.12]} scale={1.3} color={pal.tint} order={31} />
      </group>
    </group>
  );
}
