import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { painted, seeded } from "../paint/painter";
import type { Growth } from "../lib/demo";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";

// 구름꽃: a soft cloud floating over the meadow. Gratitude lines sprout little leaves on it,
// and every 7 logged days a flower blooms. Petals drift down now and then.
const X = -1.0;
const Y = 3.3;
const GROUND_Y = 0.5;

const PETAL_COLORS = ["#F4B6C2", "#F6D46A", "#F29A7E", "#C9B6E8"];

function cloudArt(base: string, shade: string) {
  return painted(`flower-cloud-${base}-${shade}`, 3.1, 2.1, (p) => {
    const puffs: [number, number, number, number][] = [
      [-0.98, -0.32, 0.46, 0.34], [-0.36, -0.42, 0.56, 0.32], [0.34, -0.42, 0.56, 0.32], [0.98, -0.3, 0.45, 0.33],
      [-0.55, 0.1, 0.56, 0.48], [0.14, 0.32, 0.62, 0.56], [0.76, 0.06, 0.5, 0.42], [-0.08, -0.06, 0.92, 0.5],
    ];
    // shaded underside first, then the lit puffs on top, so the shade stays along the bottoms
    for (const [x, y, rx, ry] of puffs) p.fill(p.ellipse(x, y, rx, ry, 0.05), shade, 0, 0);
    for (const [x, y, rx, ry] of puffs) p.fill(p.ellipse(x - 0.02, y + 0.07, rx * 0.93, ry * 0.88, 0.06), base, 0.015, 0.012);
    p.strands(260, 0.04, "rgba(120,100,140,0.035)");
  }, { grain: 0.04, mottle: 0.05 });
}

function leafArt() {
  return painted("cloud-leaf", 0.16, 0.12, (p) => {
    p.blob(0, 0, 0.045, 0.022, "#8DB27A", { fuzz: 0.004, wob: 0.05 });
    p.stroke([[-0.035, 0], [0.035, 0]], "#76A066", 0.004);
  }, { grain: 0.03 });
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

// Where flowers bloom, in cloud space, in the order they appear.
const SPOTS: [number, number][] = [
  [-0.3, 0.55], [0.55, 0.32], [-0.85, 0.1], [0.2, 0.0], [0.95, -0.1], [-0.5, -0.25], [0.1, 0.72],
  [-1.1, -0.3], [0.6, -0.35], [-0.1, 0.35], [1.15, -0.4], [-0.75, 0.45], [0.4, 0.62], [-0.2, -0.4],
];

const PETALS = 4;
const SPARKLES = 12;

export function canopyScale(g: Growth) {
  // a small cloud at first; full size around 90 leaves (about a month of gratitude)
  return 0.8 + 0.2 * Math.min(1, g.leaves / 90);
}

export function CloudFlower({ pal, growth, night }: { pal: Palette; growth: Growth; night: boolean }) {
  const base = pal.cloud ?? "#FFF9F1";
  const shade = pal.cloudShade ?? "#E6DDEA";
  const cloud = useMemo(() => cloudArt(base, shade), [base, shade]);
  const leaf = useMemo(leafArt, []);
  const flowers = useMemo(() => PETAL_COLORS.map(flowerArt), []);
  const petal = useMemo(petalArt, []);
  const sparkle = useMemo(sparkleArt, []);
  const shadow = useMemo(shadowArt, []);

  const s = canopyScale(growth);
  const leafCount = Math.min(28, growth.leaves);
  const leaves = useMemo(() => {
    const r = seeded(7);
    const out: { x: number; y: number; rot: number; k: number }[] = [];
    while (out.length < 40) {
      const x = (r() - 0.5) * 2.5, y = (r() - 0.45) * 1.3;
      if ((x / 1.25) ** 2 + ((y - 0.05) / 0.62) ** 2 > 1) continue;
      out.push({ x, y, rot: (r() - 0.5) * 2.4, k: 0.8 + r() * 0.5 });
    }
    return out;
  }, []);
  const shown = Math.min(SPOTS.length, growth.flowers);

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
    }
    // petals: each falls for ~9 s from a flower toward the ground, swaying, then starts over
    petalRefs.current.forEach((g, i) => {
      if (!g) return;
      if (shown === 0) {
        g.visible = false;
        return;
      }
      const cyc = (t / 9 + i / PETALS) % 1;
      const [sx, sy] = SPOTS[(i * 3 + Math.floor(t / 9 + i / PETALS)) % shown];
      const startY = Y + sy * s;
      g.visible = true;
      g.position.set(X + sx * s + Math.sin(cyc * 9 + i) * 0.18 + cyc * 0.5, startY - cyc * (startY - GROUND_Y), Z.tree + 0.4);
      g.rotation.z = cyc * 6 + i;
      const m = (g.children[0] as THREE.Mesh | undefined)?.material as THREE.MeshBasicMaterial | undefined;
      if (m) m.opacity = Math.min(1, cyc * 8) * Math.min(1, (1 - cyc) * 4);
    });
    // floating light motes
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
          {leaves.slice(0, leafCount).map((l, i) => (
            <group key={i} position={[l.x, l.y, 0.01]} rotation={[0, 0, l.rot]} scale={l.k}>
              <Sprite art={leaf} color={pal.tint} order={13} />
            </group>
          ))}
          {SPOTS.slice(0, shown).map(([x, y], i) => (
            <Sprite key={i} art={flowers[i % flowers.length]} position={[x, y, 0.02]} scale={0.95 + ((i * 37) % 5) * 0.07} color={pal.tint} order={14} />
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
