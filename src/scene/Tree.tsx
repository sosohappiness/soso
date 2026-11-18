import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { painted } from "../paint/painter";
import type { Growth } from "../lib/demo";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";

const TREE_X = -1.05;
const GROUND_Y = 0.42;

function trunkArt(color: string) {
  return painted(`trunk-${color}`, 0.8, 2.6, (p) => {
    p.poly([
      [-0.17, -1.25], [0.19, -1.25], [0.11, -0.7], [0.085, 0.0], [0.09, 0.7], [0.12, 1.2],
      [-0.1, 1.2], [-0.07, 0.6], [-0.075, -0.1], [-0.1, -0.75],
    ], color, { wob: 0.01 });
    // one small branch stub, as in the mockup
    p.poly([[0.07, 0.75], [0.3, 1.08], [0.24, 1.13], [0.04, 0.88]], color, { wob: 0.006 });
  }, { grain: 0.06 });
}

function canopyArt(base: string, light: string) {
  return painted(`canopy-${base}`, 2.9, 2.5, (p) => {
    const puffs: [number, number, number, number][] = [
      [0, 0.75, 0.55, 0.42], [-0.62, 0.32, 0.55, 0.46], [0.6, 0.3, 0.6, 0.48],
      [-0.95, -0.25, 0.42, 0.36], [0.95, -0.28, 0.4, 0.35], [0, 0.05, 0.85, 0.6],
      [-0.35, -0.55, 0.62, 0.38], [0.4, -0.55, 0.6, 0.38],
    ];
    for (const [x, y, rx, ry] of puffs) p.blob(x, y, rx, ry, base, { wob: 0.05, fuzz: 0.012 });
    // lighter painted patches inside the canopy
    p.blob(-0.42, 0.05, 0.42, 0.24, light, { wob: 0.08, fuzz: 0.03 });
    p.blob(0.45, -0.3, 0.3, 0.17, light, { wob: 0.08, fuzz: 0.03 });
    p.blob(0.1, 0.62, 0.22, 0.12, light, { wob: 0.08, fuzz: 0.03 });
  }, { grain: 0.07, mottle: 0.08 });
}

function blossomArt() {
  return painted("blossom", 0.24, 0.24, (p) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      p.blob(Math.cos(a) * 0.035, Math.sin(a) * 0.035, 0.034, 0.03, "#FBF6EC", { fuzz: 0.006, rot: a });
    }
    p.blob(0, 0, 0.022, 0.022, "#FBF6EC", { fuzz: 0.004 });
  }, { grain: 0.03 });
}

function petalArt() {
  return painted("petal", 0.16, 0.1, (p) => p.blob(0, 0, 0.045, 0.022, "#F7F0E2", { fuzz: 0.006 }), { grain: 0.03 });
}

function shadowArt() {
  return painted("tree-shadow", 1.6, 0.3, (p) => p.blob(0, 0, 0.7, 0.07, "#000", { fuzz: 0.02 }), { grain: 0.15 });
}

// Spots for flowers, in canopy space. Flowers fill in order as gratitude days add up.
const SPOTS: [number, number][] = [
  [-0.35, 0.42], [0.3, 0.7], [0.55, -0.05], [-0.8, -0.15], [0.05, -0.4], [-0.15, 0.1],
  [0.95, -0.4], [-0.55, -0.55], [0.7, 0.4], [-0.95, 0.35], [0.35, -0.65], [0.0, 0.85],
  [-0.4, -0.25], [0.8, 0.05],
];
const PETALS: [number, number][] = [[-1.7, 0.18], [-0.55, 0.12], [0.1, 0.06], [-1.25, 0.02], [0.45, 0.2]];

export function canopyScale(g: Growth) {
  // starts as a young tree; reaches full size around 90 leaves (one month)
  return 0.78 + 0.22 * Math.min(1, g.leaves / 90);
}

export function Tree({ pal, growth }: { pal: Palette; growth: Growth }) {
  const trunk = useMemo(() => trunkArt(pal.trunk), [pal.trunk]);
  const canopy = useMemo(() => canopyArt(pal.canopy, pal.canopyLight), [pal.canopy, pal.canopyLight]);
  const blossom = useMemo(blossomArt, []);
  const petal = useMemo(petalArt, []);
  const shadow = useMemo(shadowArt, []);
  const sway = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (sway.current) sway.current.rotation.z = Math.sin(clock.elapsedTime * 0.45) * 0.012;
  });

  const s = canopyScale(growth);
  const shown = Math.min(SPOTS.length, growth.flowers);
  const fallen = Math.min(PETALS.length, Math.max(0, growth.flowers - 1));

  return (
    <group>
      <Sprite art={shadow} position={[TREE_X + 0.05, GROUND_Y - 0.06, Z.tree - 0.05]} color="#000" opacity={pal.shadow} order={11} />
      <Sprite art={trunk} position={[TREE_X, GROUND_Y + 1.25 * s, Z.tree]} scale={[1, s, 1]} color={pal.tint} order={12} />
      {/* the canopy sways from the top of the trunk */}
      <group position={[TREE_X, GROUND_Y + 2.35 * s, Z.tree + 0.05]}>
        <group ref={sway} scale={s}>
          <Sprite art={canopy} position={[0, 0.95, 0]} color={pal.tint} order={13} />
          {SPOTS.slice(0, shown).map(([x, y], i) => (
            <Sprite key={i} art={blossom} position={[x, 0.95 + y, 0.02]} scale={0.9 + ((i * 37) % 5) * 0.06} color={pal.tint} order={14} />
          ))}
        </group>
      </group>
      {PETALS.slice(0, fallen).map(([x, y], i) => (
        <Sprite key={i} art={petal} position={[x, GROUND_Y + y - 0.3, Z.tree + 0.3]} color={pal.tint} order={15} />
      ))}
    </group>
  );
}

export const TREE = { x: TREE_X, groundY: GROUND_Y };
