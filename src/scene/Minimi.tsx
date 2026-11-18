import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "../lib/time";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import {
  ANIMALS, BODY_TEX, FACE, at, bodyTex, cupTex, eyeTex, noseTex, pawTex, shadowTex, zTex, type AnimalId,
} from "./animals";

/** Where Minimi sits: the base of the silhouette, on the ground right of the tree. */
export const MINIMI_POS = new THREE.Vector3(0.72, 0.12, Z.minimi);
const CUP_X = 0.72;
const SCALE = 1.12;

/**
 * Pose targets per time of day. The body is one mass, so moods are shown by how it squashes,
 * stretches and leans, plus the eyes. Values blend smoothly when the phase changes.
 */
type Pose = {
  sx: number; sy: number; // squash / stretch of the whole body
  lean: number;           // radians, + leans right
  sway: number;           // side-to-side sway amplitude
  hop: number;            // little bounce amplitude
  stretch: number;        // 0–1 strength of the periodic morning stretch
  eyeOpen: number;        // 1 open, ~0.35 droopy, 0 closed
  breathe: number; breatheHz: number;
  zzz: number;
};

const POSES: Record<Phase, Pose> = {
  morning: { sx: 1, sy: 1, lean: 0, sway: 0.015, hop: 0, stretch: 1, eyeOpen: 1, breathe: 0.012, breatheHz: 0.35, zzz: 0 },
  day: { sx: 1, sy: 1.02, lean: 0, sway: 0.045, hop: 0.018, stretch: 0, eyeOpen: 1, breathe: 0.012, breatheHz: 0.4, zzz: 0 },
  evening: { sx: 1.07, sy: 0.88, lean: -0.07, sway: 0.01, hop: 0, stretch: 0, eyeOpen: 0.35, breathe: 0.02, breatheHz: 0.25, zzz: 0.6 },
  night: { sx: 1.16, sy: 0.74, lean: 0, sway: 0, hop: 0, stretch: 0, eyeOpen: 0, breathe: 0.028, breatheHz: 0.18, zzz: 1 },
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type Props = {
  animal: AnimalId;
  phase: Phase;
  pal: Palette;
  /** Filled every frame with the world position of the top of the head, for the speech bubble. */
  anchor: THREE.Vector3;
  pokeAt: number; // timestamp of the last poke; drives a little bounce
  onPoke: () => void;
};

export function Minimi({ animal, phase, pal, anchor, pokeAt, onPoke }: Props) {
  const a = ANIMALS[animal];
  const art = useMemo(() => ({
    body: bodyTex(a), paw: pawTex(a), nose: noseTex(a), cup: cupTex(a),
    eye: eyeTex(false), eyeShut: eyeTex(true), z: zTex(), shadow: shadowTex(),
  }), [a]);

  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const shut = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const zs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const cur = useRef<Pose>({ ...POSES[phase] });
  const blinkAt = useRef(2);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const target = POSES[phase];
    const c = cur.current;
    const k = 1 - Math.exp(-dt * 2.5);
    for (const key of Object.keys(target) as (keyof Pose)[]) c[key] = lerp(c[key], target[key], k);

    // morning stretch: every 6 s, reach up tall and thin, then settle
    const sc = (t % 6) / 6;
    const stretch = c.stretch * Math.max(0, Math.sin(Math.min(1, sc * 2.2) * Math.PI));
    const since = (performance.now() - pokeAt) / 1000;
    const bounce = since < 0.8 ? Math.sin(since * Math.PI * 3) * Math.exp(-since * 4) : 0;
    const breath = Math.sin(t * Math.PI * 2 * c.breatheHz);
    const hop = Math.max(0, Math.sin(t * 2.4)) * c.hop;

    if (body.current) {
      const sy = c.sy * (1 + breath * c.breathe + stretch * 0.09 + bounce * 0.12);
      const sx = c.sx * (1 - breath * c.breathe * 0.5 - stretch * 0.05 - bounce * 0.06);
      body.current.scale.set(sx, sy, 1);
      body.current.rotation.z = c.lean + Math.sin(t * 0.9) * c.sway;
      body.current.position.y = hop;
    }

    if (t > blinkAt.current + 0.14) blinkAt.current = t + 2 + Math.random() * 3.5;
    const blinking = t > blinkAt.current && c.eyeOpen > 0.3;
    const open = blinking ? 0.08 : c.eyeOpen;
    eyes.forEach((e) => {
      if (!e.current) return;
      e.current.scale.y = Math.max(0.1, open);
      e.current.visible = open > 0.15;
    });
    shut.forEach((e) => e.current && (e.current.visible = open <= 0.15));

    zs.forEach((z, i) => {
      if (!z.current) return;
      const p = (t * 0.25 + i / 3) % 1;
      z.current.visible = c.zzz > 0.05 && i < Math.round(c.zzz * 3);
      z.current.position.set(0.32 + p * 0.25, 0.95 * c.sy + p * 0.45, 0.06);
      z.current.scale.setScalar((0.9 + p * 0.9) * (i === 1 ? 0.8 : 1));
    });

    if (head.current) {
      head.current.getWorldPosition(tmp);
      anchor.copy(tmp);
    }
  });

  const poke = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPoke();
  };

  const tint = pal.tint;
  const paws: [number, number][] = [at(-34, 4), at(34, 4)];

  return (
    <group position={MINIMI_POS} scale={SCALE}>
      <Sprite art={art.shadow} position={[0.1, 0.0, -0.06]} color="#000" opacity={pal.shadow} order={20} />
      <Sprite art={art.cup} position={[CUP_X, 0.15 * 1.5, 0.04]} scale={1.5} color={tint} order={30} />
      <group ref={body} onPointerDown={poke}>
        <Sprite art={art.body} position={[0, -BODY_TEX.baseY, 0]} color={tint} order={22} />
        {[FACE.eyeL, FACE.eyeR].map(([x, y], i) => (
          <group key={i}>
            <Sprite ref={eyes[i]} art={art.eye} position={[x, y, 0.01]} color={tint} order={26} />
            <Sprite ref={shut[i]} art={art.eyeShut} position={[x, y - 0.01, 0.01]} color={tint} order={26} visible={false} />
          </group>
        ))}
        <Sprite art={art.nose} position={[FACE.nose[0], FACE.nose[1], 0.01]} color={tint} order={26} />
        <group ref={head} position={[FACE.headTop[0], FACE.headTop[1], 0]} />
      </group>
      {paws.map(([x, y], i) => (
        <Sprite key={i} art={art.paw} position={[x, y, 0.05]} color={tint} order={28} />
      ))}
      {zs.map((z, i) => (
        <Sprite key={i} ref={z} art={art.z} order={29} visible={false} />
      ))}
    </group>
  );
}
