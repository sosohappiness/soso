import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { painted, type Pt } from "../paint/painter";
import type { Phase } from "../lib/time";
import { Sprite } from "./Sprite";
import type { Palette } from "./palette";

// Depth layers of the diorama (z). The camera turns around x=0, so far layers drift less.
export const Z = { sky: -7, sky2: -6.5, celestial: -6, clouds: -5, hill: -1.6, tree: -0.7, minimi: 0.3, front: 1.3 };

const WHITE = "#ffffff";

function skyArt() {
  // neutral white with grain + mottle; the palette colour is multiplied on top
  return painted("sky", 46, 26, (p) => {
    p.ctx.fillStyle = WHITE;
    p.ctx.fillRect(-23, -13, 46, 26);
  }, { ppu: 40, grain: 0.06, mottle: 0.06 });
}

function hillArt() {
  return painted("hill", 26, 7, (p) => {
    const top: Pt[] = [];
    for (let i = 0; i <= 26; i++) {
      const x = -13 + i;
      top.push([x, 2.6 + Math.sin(x * 0.45 + 0.6) * 0.07 + Math.sin(x * 0.17) * 0.12 + x * 0.006]);
    }
    p.poly([...top, [13, -3.5], [-13, -3.5]], WHITE, { wob: 0.012, fuzz: 0.03 });
  }, { ppu: 72, grain: 0.05, mottle: 0.07 });
}

function frontArt() {
  return painted("front", 26, 5, (p) => {
    const top: Pt[] = [];
    for (let i = 0; i <= 26; i++) {
      const x = -13 + i;
      top.push([x, 1.6 + Math.sin(x * 0.55 + 2) * 0.06 + Math.sin(x * 0.21 + 1) * 0.1]);
    }
    p.poly([...top, [13, -2.5], [-13, -2.5]], WHITE, { wob: 0.012, fuzz: 0.03 });
  }, { ppu: 64, grain: 0.05, mottle: 0.07 });
}

function celestialArt(phase: Phase) {
  if (phase === "evening") {
    // the mockup's moon: navy dome with the yellow yolk slipping out underneath
    return painted("moon-evening", 1.6, 1.3, (p) => {
      p.blob(0, -0.16, 0.24, 0.24, "#F2C230");
      const dome: Pt[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = Math.PI * (i / 24);
        dome.push([Math.cos(t) * 0.56, Math.sin(t) * 0.56]);
      }
      p.poly(dome, "#1E2456", { wob: 0.006 });
    });
  }
  if (phase === "night") {
    return painted("moon-night", 1.2, 1.2, (p) => {
      p.blob(0, 0, 0.3, 0.3, "#F2C230");
      p.ctx.globalCompositeOperation = "destination-out";
      p.blob(0.14, 0.09, 0.27, 0.27, "#000", { fuzz: 0 });
      p.ctx.globalCompositeOperation = "source-over";
    });
  }
  return painted(`sun-${phase}`, 1.2, 1.2, (p) => {
    p.blob(0, 0, 0.32, 0.32, phase === "morning" ? "#F6CF4A" : "#F2C230");
  });
}

function cloudArt(i: number) {
  return painted(`cloud-${i}`, 3.2, 1.3, (p) => {
    const c = "#F6E9DA";
    const puffs = i === 0
      ? [[-0.9, -0.15, 0.5, 0.32], [-0.3, 0.05, 0.55, 0.42], [0.35, 0.0, 0.5, 0.38], [0.95, -0.15, 0.45, 0.28], [0, -0.28, 1.25, 0.18]]
      : [[-0.5, -0.1, 0.42, 0.28], [0.05, 0.05, 0.48, 0.36], [0.6, -0.1, 0.38, 0.25], [0.05, -0.25, 0.85, 0.14]];
    for (const [x, y, rx, ry] of puffs) p.blob(x, y, rx, ry, c, { wob: 0.06, fuzz: 0.025 });
  }, { grain: 0.06, mottle: 0.04 });
}

function starArt() {
  return painted("star", 0.12, 0.12, (p) => p.blob(0, 0, 0.022, 0.022, "#F6EBC8", { fuzz: 0.008 }), { grain: 0.02 });
}

const STARS: [number, number][] = [
  [-1.6, 5.6], [-0.7, 6.3], [0.3, 5.2], [-1.9, 4.4], [2.2, 4.3], [0.9, 6.6], [-2.6, 6.1], [2.7, 6.2], [-0.2, 4.4], [1.9, 5.5], [3.3, 5.0], [-3.2, 4.9],
];

export function Backdrop({ phase, pal }: { phase: Phase; pal: Palette }) {
  const sky = useMemo(skyArt, []);
  const hill = useMemo(hillArt, []);
  const front = useMemo(frontArt, []);
  const cel = useMemo(() => celestialArt(phase), [phase]);
  const clouds = useMemo(() => [cloudArt(0), cloudArt(1)], []);
  const star = useMemo(starArt, []);
  const cloudRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const starRefs = useRef<(THREE.Group | null)[]>([]);
  const showClouds = phase === "morning" || phase === "day";

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const c0 = cloudRefs[0].current, c1 = cloudRefs[1].current;
    if (c0) c0.position.x = -2.6 + Math.sin(t * 0.03) * 1.2;
    if (c1) c1.position.x = 2.4 + Math.sin(t * 0.025 + 2) * 1.0;
    starRefs.current.forEach((s, i) => {
      if (!s) return;
      const k = 0.75 + Math.sin(t * (0.6 + i * 0.13) + i) * 0.25;
      s.scale.setScalar(k);
    });
  });

  const celPos: [number, number, number] =
    phase === "morning" ? [1.45, 4.9, Z.celestial] : phase === "day" ? [0.9, 6.2, Z.celestial] : phase === "evening" ? [1.25, 5.25, Z.celestial] : [1.35, 5.6, Z.celestial];

  return (
    <group>
      <Sprite art={sky} position={[0, 4, Z.sky]} color={pal.sky} order={0} />
      {phase === "night" &&
        STARS.map(([x, y], i) => (
          <Sprite key={i} ref={(g) => (starRefs.current[i] = g)} art={star} position={[x, y, Z.sky2]} order={1} />
        ))}
      <Sprite art={cel} position={celPos} order={2} />
      <Sprite ref={cloudRefs[0]} art={clouds[0]} position={[-2.6, 5.6, Z.clouds]} order={3} visible={showClouds} />
      <Sprite ref={cloudRefs[1]} art={clouds[1]} position={[2.4, 3.9, Z.clouds]} order={3} visible={showClouds} />
      <Sprite art={hill} position={[0, -2.0, Z.hill]} color={pal.hill} order={10} />
      <Sprite art={front} position={[0, -2.8, Z.front]} color={pal.ground} order={60} />
    </group>
  );
}
