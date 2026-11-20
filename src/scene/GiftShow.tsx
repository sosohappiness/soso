import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GIFT_T, GIFTS, type GiftId } from "../lib/gifts";
import { giftItemTex } from "./props";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import type { Seat } from "./Minimi";
import { shadowTex } from "./animals";
import {
  PAWS_AT, SPOUT_FROM_PIVOT, SQ_BODY, SQ_TAIL, TAIL_TIP, TEAPOT_PIVOT,
  emptyCupTex, squirrelBodyTex, squirrelPawTex, squirrelTailTex, streamTex, teapotTex,
} from "./squirrel";

// The gift friend: a squirrel hops in carrying a teapot with its tail. For the matcha latte it
// tips the teapot and pours into the cup in its paws; then it hands the gift to Minimi,
// waves its tail, turns around and hops off. Minimi's own reaction lives in Minimi.tsx.

const HS = 1.3;            // squirrel size
const MINIMI_SCALE = 1.12; // must match Minimi
const ITEM_SCALE = 1.3 * MINIMI_SCALE;
const PAW_ITEM_SCALE = 1.05;
const POUR = { start: GIFT_T.walkIn + 0.1, end: GIFT_T.give - 0.6 };

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

type Props = { pal: Palette; seat: Seat; groundY: number; gift: { at: number; item: GiftId } | null };

export function GiftShow({ pal, seat, groundY, gift }: Props) {
  const art = useMemo(() => ({
    body: squirrelBodyTex(), tail: squirrelTailTex(), paw: squirrelPawTex(), teapot: teapotTex(),
    stream: streamTex(), emptyCup: emptyCupTex(), shadow: shadowTex(),
  }), []);
  const itemArt = useMemo(() => (gift ? giftItemTex(gift.item) : null), [gift?.item]);
  const pours = gift?.item === "matcha";
  const kind = gift ? GIFTS[gift.item].kind : "hold";
  const targetY = kind === "head" ? 1.15 : kind === "face" ? 0.8 : 0.5;

  const root = useRef<THREE.Group>(null);
  const hop = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const pot = useRef<THREE.Group>(null);
  const spout = useRef<THREE.Group>(null);
  const inPaws = useRef<THREE.Group>(null);
  const emptyRef = useRef<THREE.Group>(null);
  const fullRef = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Group>(null);
  const flying = useRef<THREE.Group>(null);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  const holdX = seat.x;
  const holdY = seat.y + targetY * MINIMI_SCALE;
  const standX = seat.x + 0.78;
  const offX = seat.x + 2.7;

  useFrame(() => {
    const g = gift ? (performance.now() - gift.at) / 1000 : -1;
    const on = g >= 0 && g < GIFT_T.leave + 0.3;
    if (root.current) root.current.visible = on;
    if (flying.current && !on) flying.current.visible = false;
    if (!on || !root.current) return;

    // hop in from the right, stand, then turn around and hop away
    const leaving = g > GIFT_T.drink + 0.4;
    const inK = smooth(g / GIFT_T.walkIn);
    const outK = smooth((g - GIFT_T.drink - 0.4) / (GIFT_T.leave - GIFT_T.drink - 0.4));
    const x = leaving ? standX + (offX - standX) * outK : offX + (standX - offX) * inK;
    const moving = g < GIFT_T.walkIn || leaving;
    root.current.position.set(x, groundY, Z.minimi + 0.9);
    root.current.scale.set(leaving ? -HS : HS, HS, 1);
    if (hop.current) {
      hop.current.position.y = moving ? Math.abs(Math.sin(g * 7)) * 0.1 : 0;
      hop.current.rotation.z = moving ? Math.sin(g * 7) * 0.04 : 0;
    }

    // the tail sways; while pouring it tips the teapot forward; it waves goodbye at the end
    const pourK = pours ? Math.sin(Math.PI * smooth((g - POUR.start) / (POUR.end - POUR.start))) : 0;
    const pouring = pours && g > POUR.start + 0.2 && g < POUR.end - 0.15;
    if (tail.current) {
      const wave = g > GIFT_T.give + 0.3 && !leaving ? Math.sin(g * 6) * 0.08 : 0;
      tail.current.rotation.z = Math.sin(g * 2.2) * 0.03 + pourK * 0.06 + wave;
    }
    if (pot.current) {
      const swing = moving ? Math.sin(g * 7 + 1) * 0.12 : Math.sin(g * 2) * 0.04;
      pot.current.rotation.z = swing + pourK * 0.75;
    }

    // what the paws hold: an empty cup that fills (matcha), or the gift itself
    const inPawsVisible = g < GIFT_T.give - 0.55;
    if (inPaws.current) inPaws.current.visible = inPawsVisible;
    if (emptyRef.current) emptyRef.current.visible = pours && g < POUR.end - 0.1;
    if (fullRef.current) fullRef.current.visible = !pours || g >= POUR.end - 0.1;

    // the tea stream: from the spout straight down into the cup
    if (stream.current && spout.current && inPaws.current) {
      stream.current.visible = pouring;
      if (pouring) {
        spout.current.getWorldPosition(a);
        inPaws.current.getWorldPosition(b);
        b.y += 0.15 * PAW_ITEM_SCALE * HS;
        const len = Math.max(0.05, a.y - b.y);
        stream.current.position.set(b.x, b.y + len / 2, Z.minimi + 0.92);
        stream.current.scale.set(1, len, 1);
      }
    }

    // hand-over: the gift floats from the paws into Minimi's paws (or onto its head or face)
    if (flying.current && inPaws.current) {
      const k = smooth((g - (GIFT_T.give - 0.55)) / 0.55);
      flying.current.visible = g >= GIFT_T.give - 0.55 && g < GIFT_T.give;
      inPaws.current.getWorldPosition(a);
      flying.current.position.set(a.x + (holdX - a.x) * k, a.y + (holdY - a.y) * k + Math.sin(k * Math.PI) * 0.15, Z.minimi + 0.95);
    }
  });

  const tint = pal.tint;
  const full = itemArt;
  return (
    <>
      <group ref={root} visible={false}>
        <Sprite art={art.shadow} position={[0.08, 0.0, -0.06]} scale={[0.7, 1, 1]} color="#000" opacity={pal.shadow} order={33} />
        <group ref={hop}>
          <group ref={tail} position={[0.18, 0.12, -0.01]}>
            <Sprite art={art.tail} position={[SQ_TAIL.at[0] - 0.18, SQ_TAIL.at[1] - 0.12, 0]} color={tint} order={34} />
            <group ref={pot} position={[TAIL_TIP[0] - 0.18, TAIL_TIP[1] - 0.12, 0.02]}>
              <Sprite art={art.teapot} pivot={TEAPOT_PIVOT} color={tint} order={35} />
              <group ref={spout} position={SPOUT_FROM_PIVOT.concat(0) as [number, number, number]} />
            </group>
          </group>
          <Sprite art={art.body} position={[0, -SQ_BODY.feetY, 0]} color={tint} order={36} />
          <group ref={inPaws} position={[PAWS_AT[0], PAWS_AT[1] - 0.15 * PAW_ITEM_SCALE + 0.02, 0.03]} scale={PAW_ITEM_SCALE}>
            <group ref={emptyRef}><Sprite art={art.emptyCup} position={[0, 0.15, 0]} color={tint} order={37} /></group>
            <group ref={fullRef}>{full && <Sprite art={full} position={[0, 0.15, 0]} color={tint} order={37} />}</group>
          </group>
          <Sprite art={art.paw} position={[PAWS_AT[0] + 0.02, PAWS_AT[1] - 0.03, 0.05]} color={tint} order={38} />
        </group>
      </group>
      <group ref={stream} visible={false}>
        <Sprite art={art.stream} color={tint} order={36.5} />
      </group>
      <group ref={flying} visible={false} scale={ITEM_SCALE}>
        {full && <Sprite art={full} position={[0, 0.15, 0]} color={tint} order={39} />}
      </group>
    </>
  );
}
