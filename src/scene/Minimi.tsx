import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "../lib/time";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import {
  ANIMALS, bodyTex, cheekTex, earTex, eyeTex, headTex, pawTex, shadowTex, tailTex, zTex, type AnimalId,
} from "./animals";

export const MINIMI_POS = new THREE.Vector3(0.82, 0.3, Z.minimi);

/** Pose targets per time of day. Values are blended smoothly when the phase changes. */
type Pose = {
  headX: number; headY: number; headTilt: number;
  eyeOpen: number; // 1 open, 0.45 droopy, 0 closed
  breathe: number; breatheHz: number;
  tailWag: number; earTwitch: number;
  stretch: number; // 0–1 strength of the periodic morning stretch
  bob: number;     // head bob amplitude
  zzz: number;     // 0 none, 1 full
};

const POSES: Record<Phase, Pose> = {
  morning: { headX: -0.6, headY: 0.36, headTilt: 0.06, eyeOpen: 1, breathe: 0.02, breatheHz: 0.35, tailWag: 0.15, earTwitch: 1, stretch: 1, bob: 0.01, zzz: 0 },
  day: { headX: -0.6, headY: 0.42, headTilt: 0.0, eyeOpen: 1, breathe: 0.018, breatheHz: 0.4, tailWag: 0.35, earTwitch: 1, stretch: 0, bob: 0.025, zzz: 0 },
  evening: { headX: -0.64, headY: 0.14, headTilt: -0.1, eyeOpen: 0.4, breathe: 0.03, breatheHz: 0.25, tailWag: 0.0, earTwitch: 0.3, stretch: 0, bob: 0.008, zzz: 0.6 },
  night: { headX: -0.68, headY: 0.04, headTilt: -0.22, eyeOpen: 0, breathe: 0.04, breatheHz: 0.18, tailWag: 0, earTwitch: 0, stretch: 0, bob: 0.004, zzz: 1 },
};

const TAIL_POS: Record<string, [number, number, number]> = {
  stub: [0.66, -0.04, -0.03],
  striped: [0.78, 0.04, -0.03],
  curl: [0.66, 0.12, -0.03],
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type Props = {
  animal: AnimalId;
  phase: Phase;
  pal: Palette;
  /** Filled every frame with the world position just above the head, for the speech bubble. */
  anchor: THREE.Vector3;
  pokeAt: number; // timestamp of the last poke; drives a little bounce
  onPoke: () => void;
};

export function Minimi({ animal, phase, pal, anchor, pokeAt, onPoke }: Props) {
  const a = ANIMALS[animal];
  const art = useMemo(() => ({
    body: bodyTex(a), head: headTex(a), ear: earTex(a), tail: tailTex(a), paw: pawTex(a),
    eye: eyeTex(false), eyeShut: eyeTex(true), cheek: cheekTex(), z: zTex(), shadow: shadowTex(),
  }), [a]);

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const paw = useRef<THREE.Group>(null);
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

    // morning stretch: every 6s, push the paw forward and lift the head
    const sc = (t % 6) / 6;
    const stretch = c.stretch * Math.max(0, Math.sin(Math.min(1, sc * 2.2) * Math.PI));
    // poke bounce
    const since = (performance.now() - pokeAt) / 1000;
    const bounce = since < 0.7 ? Math.sin(since * Math.PI * 3) * Math.exp(-since * 4) * 0.12 : 0;

    const breath = Math.sin(t * Math.PI * 2 * c.breatheHz);
    if (body.current) {
      body.current.scale.set(1 + stretch * 0.05 - breath * c.breathe * 0.3, 1 + breath * c.breathe, 1);
    }
    if (head.current) {
      head.current.position.set(
        c.headX - stretch * 0.08,
        c.headY + Math.sin(t * 1.3) * c.bob + stretch * 0.08 + bounce,
        0.03,
      );
      head.current.rotation.z = c.headTilt + Math.sin(t * 0.9) * c.bob * 3 + stretch * 0.18;
    }
    if (paw.current) paw.current.position.x = -0.5 - stretch * 0.22;

    // ears twitch now and then
    const tw = c.earTwitch * (Math.sin(t * 7) > 0.97 ? 0.2 : 0);
    if (earL.current) earL.current.rotation.z = 0.15 + tw;
    if (earR.current) earR.current.rotation.z = -0.15 - tw * 0.5;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 6) * c.tailWag * 0.5;

    // blinking (only when awake)
    if (t > blinkAt.current + 0.14) blinkAt.current = t + 2 + Math.random() * 3.5;
    const blinking = t > blinkAt.current && c.eyeOpen > 0.3;
    const open = blinking ? 0.08 : c.eyeOpen;
    eyes.forEach((e) => {
      if (!e.current) return;
      e.current.scale.y = Math.max(0.08, open);
      e.current.visible = open > 0.12;
    });
    shut.forEach((e) => e.current && (e.current.visible = open <= 0.12));

    // z z z drifting up from the head
    zs.forEach((z, i) => {
      if (!z.current) return;
      const p = ((t * 0.25 + i / 3) % 1);
      z.current.visible = c.zzz > 0.05 && (i < Math.round(c.zzz * 3));
      z.current.position.set(c.headX + 0.25 + p * 0.25, c.headY + 0.3 + p * 0.45, 0.06);
      z.current.scale.setScalar((0.9 + p * 0.9) * (i === 1 ? 0.8 : 1));
    });

    if (head.current && root.current) {
      head.current.getWorldPosition(tmp);
      anchor.copy(tmp);
    }
  });

  const poke = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPoke();
  };

  const tint = pal.tint;
  const floppy = a.ears === "floppy";
  const earY = floppy ? 0.08 : 0.2;
  const earX = floppy ? 0.27 : 0.2;

  return (
    <group ref={root} position={MINIMI_POS} onPointerDown={poke}>
      <Sprite art={art.shadow} position={[0.06, -0.3, -0.06]} color="#000" opacity={pal.shadow} order={20} />
      <Sprite ref={tail} art={art.tail} position={TAIL_POS[a.tail]} color={tint} order={21} />
      <group ref={body} position={[0, -0.3, 0]}>
        <Sprite art={art.body} position={[0, 0.3, 0]} color={tint} order={22} />
      </group>
      <group ref={head} position={[-0.6, 0.3, 0.03]}>
        {!floppy && (
          <>
            <Sprite ref={earL} art={art.ear} position={[-earX, earY, -0.01]} color={tint} order={23} pivot={[0, -0.08]} />
            <Sprite ref={earR} art={art.ear} position={[earX, earY, -0.01]} color={tint} order={23} pivot={[0, -0.08]} />
          </>
        )}
        <Sprite art={art.head} color={tint} order={24} />
        {floppy && (
          <>
            <Sprite ref={earL} art={art.ear} position={[-earX, earY, 0.01]} color={tint} order={27} pivot={[0, 0.08]} />
            <Sprite ref={earR} art={art.ear} position={[earX, earY, 0.01]} color={tint} order={27} pivot={[0, 0.08]} />
          </>
        )}
        {animal !== "redpanda" && (
          <>
            <Sprite art={art.cheek} position={[-0.17, -0.07, 0.005]} color={tint} opacity={0.7} order={25} />
            <Sprite art={art.cheek} position={[0.17, -0.07, 0.005]} color={tint} opacity={0.7} order={25} />
          </>
        )}
        {[-1, 1].map((s, i) => (
          <group key={s}>
            <Sprite ref={eyes[i]} art={art.eye} position={[s * 0.1, 0.03, 0.01]} color={tint} order={26} />
            <Sprite ref={shut[i]} art={art.eyeShut} position={[s * 0.1, 0.02, 0.01]} color={tint} order={26} visible={false} />
          </group>
        ))}
      </group>
      <Sprite ref={paw} art={art.paw} position={[-0.5, -0.24, 0.05]} color={tint} order={28} />
      {zs.map((z, i) => (
        <Sprite key={i} ref={z} art={art.z} order={29} visible={false} />
      ))}
    </group>
  );
}
