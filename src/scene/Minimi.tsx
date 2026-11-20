import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "../lib/time";
import { GIFT_T, type GiftItem } from "../lib/giftReader";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import {
  ANIMALS, BODY_TEX, FACE, at, bodyTex, cupTex, earTex, eyeTex, giftBoxTex, happyEyeTex, heartTex, noseTex, pawTex, shadowTex, zTex, type AnimalId,
} from "./animals";

/** Where Minimi sits: on the ground right of the tree, or on the sofa seat. */
export type Seat = { x: number; y: number; cup: [number, number]; shadow: boolean };
export const GROUND_SEAT: Seat = { x: 0.72, y: 0.12, cup: [0.8, 0], shadow: true };
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
  // ears are a mood device: angle outward (+ = droop), lift, and how lively they are
  earOut: number; earLift: number; earWiggle: number; earTwitch: number;
};

const POSES: Record<Phase, Pose> = {
  morning: { sx: 1, sy: 1, lean: 0, sway: 0.015, hop: 0, stretch: 1, eyeOpen: 1, breathe: 0.012, breatheHz: 0.35, zzz: 0, earOut: 0.05, earLift: 0.005, earWiggle: 0.04, earTwitch: 0.5 },
  day: { sx: 1, sy: 1.02, lean: 0, sway: 0.045, hop: 0.018, stretch: 0, eyeOpen: 1, breathe: 0.012, breatheHz: 0.4, zzz: 0, earOut: -0.06, earLift: 0.015, earWiggle: 0.1, earTwitch: 1 },
  evening: { sx: 1.07, sy: 0.88, lean: -0.07, sway: 0.01, hop: 0, stretch: 0, eyeOpen: 0.35, breathe: 0.02, breatheHz: 0.25, zzz: 0.6, earOut: 0.5, earLift: -0.025, earWiggle: 0.015, earTwitch: 0.15 },
  night: { sx: 1.16, sy: 0.74, lean: 0, sway: 0, hop: 0, stretch: 0, eyeOpen: 0, breathe: 0.028, breatheHz: 0.18, zzz: 1, earOut: 0.95, earLift: -0.05, earWiggle: 0, earTwitch: 0 },
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
  seat?: Seat;
  /** A gift being given right now: Minimi perks up, receives it, enjoys it. */
  gift?: { at: number; item: GiftItem } | null;
};

export function Minimi({ animal, phase, pal, anchor, pokeAt, onPoke, seat = GROUND_SEAT, gift = null }: Props) {
  const a = ANIMALS[animal];
  const art = useMemo(() => ({
    body: bodyTex(a), paw: pawTex(a), nose: noseTex(a), cup: cupTex(a),
    eye: eyeTex(false), eyeShut: eyeTex(true), z: zTex(), shadow: shadowTex(),
    ears: [earTex(a, -1), earTex(a, 1)],
    happy: happyEyeTex(), heart: heartTex(), giftCup: cupTex(ANIMALS.polar), giftBox: giftBoxTex(),
  }), [a]);
  const happyRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const pawRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const held = useRef<THREE.Group>(null);
  const heartRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const earRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const twitchAt = useRef({ t: 3, side: 0 });
  const floppy = a.ears === "floppy";

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
    // during a gift, the gift's beats override the time-of-day pose
    const g = gift ? (performance.now() - gift.at) / 1000 : -1;
    const giving = g >= 0 && g < GIFT_T.leave;
    const holding = giving && g >= GIFT_T.give && g < GIFT_T.drink;
    const pleased = giving && g >= GIFT_T.give;
    let target = POSES[phase];
    if (giving) {
      const base = { ...target, zzz: 0, stretch: 0, eyeOpen: 1, earTwitch: 0 };
      target = g < GIFT_T.give
        ? { ...base, sy: 1.05, sx: 0.98, lean: -0.07, sway: 0.01, hop: 0, earOut: -0.18, earLift: 0.025, earWiggle: 0.04 }
        : g < GIFT_T.drink
          ? { ...base, sy: 1, sx: 1.02, lean: 0, sway: 0.035, hop: 0, earOut: 0.45, earLift: -0.01, earWiggle: 0.05 }
          : { ...base, sy: 1.02, sx: 1, lean: 0, sway: 0.02, hop: 0.03, earOut: 0.08, earLift: 0.01, earWiggle: 0.08 };
    }
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

    // ears: droop with tiredness, flick up when poked, twitch now and then when awake
    if (t > twitchAt.current.t + 0.35) twitchAt.current = { t: t + 1.5 + Math.random() * 4, side: Math.random() < 0.5 ? 0 : 1 };
    const tw = twitchAt.current;
    earRefs.forEach((e, i) => {
      if (!e.current) return;
      const sx = i === 0 ? -1 : 1;
      const twitch = t > tw.t && tw.side === i ? Math.sin((t - tw.t) * Math.PI * 6) * 0.25 * c.earTwitch : 0;
      const wiggle = Math.sin(t * (floppy ? 3.2 : 1.7) + i * 1.3) * c.earWiggle * (floppy ? 2.2 : 1);
      const out = c.earOut + wiggle + twitch - bounce * 0.5 + stretch * -0.12;
      // upright ears droop by rotating their tips outward; floppy ears swing their tips outward
      e.current.rotation.z = floppy ? sx * out * 0.7 : -sx * out;
      const [bx, by] = art.ears[i].base;
      e.current.position.set(bx, by + c.earLift + stretch * 0.02 + Math.max(0, bounce) * 0.03, floppy ? 0.012 : -0.01);
    });

    if (t > blinkAt.current + 0.14) blinkAt.current = t + 2 + Math.random() * 3.5;
    const blinking = t > blinkAt.current && c.eyeOpen > 0.3;
    const open = blinking ? 0.08 : c.eyeOpen;
    eyes.forEach((e) => {
      if (!e.current) return;
      e.current.scale.y = Math.max(0.1, open);
      e.current.visible = open > 0.15 && !pleased;
    });
    shut.forEach((e) => e.current && (e.current.visible = open <= 0.15 && !pleased));
    happyRefs.forEach((e) => e.current && (e.current.visible = pleased));

    // paws come up to hold the cup, then go back down
    const reach = giving && g > GIFT_T.walkIn ? Math.min(1, (g - GIFT_T.walkIn) / 0.5) * (g < GIFT_T.drink ? 1 : Math.max(0, 1 - (g - GIFT_T.drink) / 0.4)) : 0;
    pawRefs.forEach((e, i) => {
      if (!e.current) return;
      const [px, py] = at(i === 0 ? -34 : 34, 4);
      e.current.position.set(lerp(px, (i === 0 ? -1 : 1) * 0.13, reach), lerp(py, 0.5, reach) + (holding ? Math.sin(g * 3) * 0.015 : 0), 0.05);
    });
    if (held.current) {
      held.current.visible = holding;
      const sip = Math.sin(g * 3) * 0.02;
      held.current.position.set(0, 0.5 + sip, 0.04);
      held.current.rotation.z = holding ? Math.sin(g * 3) * 0.08 : 0;
    }
    heartRefs.forEach((h, i) => {
      if (!h.current) return;
      const hp = giving && g > GIFT_T.give + 0.4 ? ((g - GIFT_T.give - 0.4) * 0.45 + i / 3) % 1 : -1;
      h.current.visible = hp >= 0 && g < GIFT_T.leave - 0.3;
      h.current.position.set(0.32 - i * 0.22 + Math.sin(hp * 6 + i) * 0.05, 1.05 + hp * 0.6, 0.07);
      h.current.scale.setScalar(0.8 + hp * 0.7);
    });

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
    <group position={[seat.x, seat.y, Z.minimi]} scale={SCALE}>
      {seat.shadow && <Sprite art={art.shadow} position={[0.1, 0.0, -0.06]} color="#000" opacity={pal.shadow} order={20} />}
      <Sprite art={art.cup} position={[seat.cup[0], seat.cup[1] + 0.15 * 1.5, 0.04]} scale={1.5} color={tint} order={30} />
      <group ref={body} onPointerDown={poke}>
        {art.ears.map((ear, i) => (
          <group key={i} ref={earRefs[i]}>
            <Sprite art={ear.art} pivot={ear.pivot} color={tint} order={floppy ? 27 : 21} />
          </group>
        ))}
        <Sprite art={art.body} position={[0, -BODY_TEX.baseY, 0]} color={tint} order={22} />
        {[FACE.eyeL, FACE.eyeR].map(([x, y], i) => (
          <group key={i}>
            <Sprite ref={eyes[i]} art={art.eye} position={[x, y, 0.01]} color={tint} order={26} />
            <Sprite ref={shut[i]} art={art.eyeShut} position={[x, y - 0.01, 0.01]} color={tint} order={26} visible={false} />
            <Sprite ref={happyRefs[i]} art={art.happy} position={[x, y, 0.01]} color={tint} order={26} visible={false} />
          </group>
        ))}
        <Sprite art={art.nose} position={[FACE.nose[0], FACE.nose[1], 0.01]} color={tint} order={26} />
        <group ref={head} position={[FACE.headTop[0], FACE.headTop[1], 0]} />
      </group>
      <group ref={held} visible={false}>
        <Sprite art={gift?.item === "matcha_latte" ? art.giftCup : art.giftBox} position={[0, 0.15 * 1.3, 0]} scale={1.3} color={tint} order={27} />
      </group>
      {paws.map(([x, y], i) => (
        <Sprite key={i} ref={pawRefs[i]} art={art.paw} position={[x, y, 0.05]} color={tint} order={28} />
      ))}
      {heartRefs.map((h, i) => (
        <Sprite key={`h${i}`} ref={h} art={art.heart} order={31} visible={false} />
      ))}
      {zs.map((z, i) => (
        <Sprite key={i} ref={z} art={art.z} order={29} visible={false} />
      ))}
    </group>
  );
}
