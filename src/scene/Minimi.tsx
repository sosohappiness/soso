import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "../lib/time";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import {
  ANIMALS, LIE, cupTex, earTex, eyeTex, headTex, limbTex, noseTex, shadowTex, tailTex, torsoTex, zTex, type AnimalId,
} from "./animals";

/** Where Minimi lies: on the ground right of the cloud, or on the sofa seat. */
export type Seat = { x: number; y: number; cup: [number, number]; shadow: boolean };
export const GROUND_SEAT: Seat = { x: 0.62, y: 0.1, cup: [1.05, 0], shadow: true };
const SCALE = 1.12;

/**
 * Minimi lies on its side with its head propped up, like lounging on a sofa.
 * Moods are shown by the head, the raised arm, the outstretched leg, the ears and the eyes.
 * Angles are radians; 0 points the limb straight up, negative turns it to the right.
 */
type Pose = {
  headTilt: number; headDrop: number;
  armUp: number; wave: number;   // raised arm angle and how much it waves
  armRest: number;
  legOut: number; kick: number;  // outstretched leg angle and how much it kicks
  stretch: number;               // 0–1 strength of the periodic morning stretch
  eyeOpen: number;
  breathe: number; breatheHz: number;
  tailWag: number;
  zzz: number;
  earOut: number; earLift: number; earWiggle: number; earTwitch: number;
};

const POSES: Record<Phase, Pose> = {
  morning: {
    headTilt: 0.32, headDrop: 0, armUp: 0.05, wave: 0.04, armRest: -2.5, legOut: -1.62, kick: 0.04, stretch: 1,
    eyeOpen: 1, breathe: 0.012, breatheHz: 0.35, tailWag: 0.15, zzz: 0, earOut: 0.05, earLift: 0.005, earWiggle: 0.04, earTwitch: 0.5,
  },
  day: {
    headTilt: 0.22, headDrop: 0, armUp: 0.28, wave: 0.3, armRest: -2.5, legOut: -1.72, kick: 0.12, stretch: 0,
    eyeOpen: 1, breathe: 0.012, breatheHz: 0.4, tailWag: 0.4, zzz: 0, earOut: -0.06, earLift: 0.012, earWiggle: 0.1, earTwitch: 1,
  },
  evening: {
    headTilt: -0.08, headDrop: -0.05, armUp: -1.95, wave: 0.02, armRest: -2.7, legOut: -1.8, kick: 0, stretch: 0,
    eyeOpen: 0.35, breathe: 0.022, breatheHz: 0.25, tailWag: 0, zzz: 0.6, earOut: 0.5, earLift: -0.02, earWiggle: 0.015, earTwitch: 0.15,
  },
  night: {
    headTilt: -0.32, headDrop: -0.12, armUp: -2.35, wave: 0, armRest: -2.9, legOut: -1.45, kick: 0, stretch: 0,
    eyeOpen: 0, breathe: 0.03, breatheHz: 0.18, tailWag: 0, zzz: 1, earOut: 0.95, earLift: -0.04, earWiggle: 0, earTwitch: 0,
  },
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type Props = {
  animal: AnimalId;
  phase: Phase;
  pal: Palette;
  /** Filled every frame with the world position of the top of the head, for the speech bubble. */
  anchor: THREE.Vector3;
  pokeAt: number;
  onPoke: () => void;
  seat?: Seat;
};

// where each ear joins the head, in head space
const EAR_BASE: Record<string, [number, number][]> = {
  round: [[-0.16, 0.17], [0.16, 0.17]],
  pointy: [[-0.13, 0.15], [0.13, 0.15]],
  floppy: [[-0.19, 0.13], [0.19, 0.13]],
};

export function Minimi({ animal, phase, pal, anchor, pokeAt, onPoke, seat = GROUND_SEAT }: Props) {
  const a = ANIMALS[animal];
  const art = useMemo(() => ({
    torso: torsoTex(a), head: headTex(a), tail: tailTex(a),
    armUp: limbTex(a, LIE.armUp.len, LIE.armUp.w, "arm"),
    armRest: limbTex(a, LIE.armRest.len, LIE.armRest.w, "arm"),
    legOut: limbTex(a, LIE.legOut.len, LIE.legOut.w, "leg"),
    legTuck: limbTex(a, LIE.legTuck.len, LIE.legTuck.w, "leg"),
    nose: noseTex(a), cup: cupTex(a), eye: eyeTex(false), eyeShut: eyeTex(true), z: zTex(), shadow: shadowTex(),
    ears: [earTex(a, -1), earTex(a, 1)],
  }), [a]);
  const floppy = a.ears === "floppy";

  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const headTop = useRef<THREE.Group>(null);
  const armUp = useRef<THREE.Group>(null);
  const armRest = useRef<THREE.Group>(null);
  const legOut = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const earRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const eyes = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const shut = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const zs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const cur = useRef<Pose>({ ...POSES[phase] });
  const blinkAt = useRef(2);
  const twitchAt = useRef({ t: 3, side: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const target = POSES[phase];
    const c = cur.current;
    const k = 1 - Math.exp(-dt * 2.5);
    for (const key of Object.keys(target) as (keyof Pose)[]) c[key] = lerp(c[key], target[key], k);

    const sc = (t % 6) / 6;
    const stretch = c.stretch * Math.max(0, Math.sin(Math.min(1, sc * 2.2) * Math.PI));
    const since = (performance.now() - pokeAt) / 1000;
    const bounce = since < 0.8 ? Math.sin(since * Math.PI * 3) * Math.exp(-since * 4) : 0;
    const breath = Math.sin(t * Math.PI * 2 * c.breatheHz);

    if (torso.current) torso.current.scale.set(1 + stretch * 0.04, 1 + breath * c.breathe, 1);
    if (head.current) {
      head.current.position.set(LIE.head.x - stretch * 0.03, LIE.head.y + c.headDrop + breath * c.breathe * 0.4 + Math.max(0, bounce) * 0.06, 0.03);
      head.current.rotation.z = -c.headTilt - stretch * 0.12 + Math.sin(t * 0.9) * 0.02 * c.eyeOpen;
    }
    if (armUp.current) armUp.current.rotation.z = -c.armUp + Math.sin(t * 3.2) * c.wave + stretch * 0.25 + bounce * 0.4;
    if (armRest.current) armRest.current.rotation.z = -c.armRest;
    if (legOut.current) {
      legOut.current.rotation.z = c.legOut + Math.sin(t * 2.1) * c.kick - stretch * 0.1;
      legOut.current.scale.y = 1 + stretch * 0.12;
    }
    if (tail.current) tail.current.rotation.z = Math.sin(t * 6) * c.tailWag * 0.4;

    // ears: droop with tiredness, flick up when poked, twitch now and then when awake
    if (t > twitchAt.current.t + 0.35) twitchAt.current = { t: t + 1.5 + Math.random() * 4, side: Math.random() < 0.5 ? 0 : 1 };
    const tw = twitchAt.current;
    const bases = EAR_BASE[a.ears];
    earRefs.forEach((e, i) => {
      if (!e.current) return;
      const sx = i === 0 ? -1 : 1;
      const twitch = t > tw.t && tw.side === i ? Math.sin((t - tw.t) * Math.PI * 6) * 0.25 * c.earTwitch : 0;
      const wiggle = Math.sin(t * (floppy ? 3.2 : 1.7) + i * 1.3) * c.earWiggle * (floppy ? 2.2 : 1);
      const out = c.earOut + wiggle + twitch - bounce * 0.5 - stretch * 0.12;
      e.current.rotation.z = floppy ? sx * out * 0.7 : -sx * (out + 0.18);
      e.current.position.set(bases[i][0], bases[i][1] + c.earLift + Math.max(0, bounce) * 0.03, floppy ? 0.012 : -0.01);
    });

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
      z.current.position.set(LIE.head.x + 0.25 + p * 0.25, LIE.head.y + 0.3 + p * 0.45, 0.06);
      z.current.scale.setScalar((0.9 + p * 0.9) * (i === 1 ? 0.8 : 1));
    });

    if (headTop.current) {
      headTop.current.getWorldPosition(tmp);
      anchor.copy(tmp);
    }
  });

  const poke = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPoke();
  };

  const tint = pal.tint;
  const limb = (ref: React.RefObject<THREE.Group>, l: { art: ReturnType<typeof limbTex>["art"]; pivot: [number, number] }, pos: { x: number; y: number }, z: number, order: number) => (
    <group ref={ref} position={[pos.x, pos.y, z]}>
      <Sprite art={l.art} pivot={l.pivot} color={tint} order={order} />
    </group>
  );

  return (
    <group position={[seat.x, seat.y, Z.minimi]} scale={SCALE}>
      {seat.shadow && <Sprite art={art.shadow} position={[0.1, 0.0, -0.06]} color="#000" opacity={pal.shadow} order={20} />}
      <Sprite art={art.cup} position={[seat.cup[0], seat.cup[1] + 0.15 * 1.5, 0.04]} scale={1.5} color={tint} order={32} />
      <group onPointerDown={poke}>
        {/* behind the body: tucked leg and tail */}
        <group position={[LIE.legTuck.x, LIE.legTuck.y, -0.02]} rotation={[0, 0, -1.15]}>
          <Sprite art={art.legTuck.art} pivot={art.legTuck.pivot} color={tint} order={21} />
        </group>
        <group ref={tail} position={[LIE.tail.x, LIE.tail.y, -0.02]}>
          <Sprite art={art.tail} color={tint} order={21} />
        </group>
        <group ref={torso} position={[LIE.torso.x, 0, 0]}>
          <Sprite art={art.torso} position={[0, LIE.torso.y, 0]} color={tint} order={22} />
        </group>
        {limb(legOut, art.legOut, LIE.legOut, 0.01, 23)}
        {limb(armUp, art.armUp, LIE.armUp, 0.015, 24)}
        <group ref={head} position={[LIE.head.x, LIE.head.y, 0.03]}>
          {art.ears.map((ear, i) => (
            <group key={i} ref={earRefs[i]}>
              <Sprite art={ear.art} pivot={ear.pivot} color={tint} order={floppy ? 28 : 24} />
            </group>
          ))}
          <Sprite art={art.head} color={tint} order={25} />
          {[LIE.face.eyeL, LIE.face.eyeR].map(([x, y], i) => (
            <group key={i}>
              <Sprite ref={eyes[i]} art={art.eye} position={[x, y, 0.01]} color={tint} order={26} />
              <Sprite ref={shut[i]} art={art.eyeShut} position={[x, y - 0.01, 0.01]} color={tint} order={26} visible={false} />
            </group>
          ))}
          <Sprite art={art.nose} position={[LIE.face.nose[0], LIE.face.nose[1], 0.01]} color={tint} order={26} />
          <group ref={headTop} position={[0.05, 0.3, 0]} />
        </group>
        {limb(armRest, art.armRest, LIE.armRest, 0.05, 29)}
      </group>
      {zs.map((z, i) => (
        <Sprite key={i} ref={z} art={art.z} order={30} visible={false} />
      ))}
    </group>
  );
}
