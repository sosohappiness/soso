import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GIFT_T, type GiftItem } from "../lib/giftReader";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import type { Seat } from "./Minimi";
import { ANIMALS, BODY_TEX, cupTex, giftBoxTex, helperPawTex, helperTex, shadowTex, trayTex } from "./animals";

// The gift helper: a polar bear in an apron walks in from the right with the gift on a tray,
// hands it to Minimi, waves, and walks off again. Minimi's own reaction lives in Minimi.tsx.

const HS = 0.95;          // helper size
const MINIMI_SCALE = 1.12; // must match Minimi
const ITEM_SCALE = 1.3 * MINIMI_SCALE;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

type Props = { pal: Palette; seat: Seat; groundY: number; gift: { at: number; item: GiftItem } | null };

export function GiftShow({ pal, seat, groundY, gift }: Props) {
  const art = useMemo(() => ({
    body: helperTex(), paw: helperPawTex(), tray: trayTex(), shadow: shadowTex(),
    cup: cupTex(ANIMALS.polar), box: giftBoxTex(),
  }), []);
  const root = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const trayRef = useRef<THREE.Group>(null);
  const pawL = useRef<THREE.Group>(null);
  const pawR = useRef<THREE.Group>(null);
  const item = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  // where Minimi holds the gift, in world space
  const holdX = seat.x;
  const holdY = seat.y + 0.5 * MINIMI_SCALE;
  const standX = seat.x + 0.95;
  const offX = seat.x + 2.6;

  useFrame(() => {
    const g = gift ? (performance.now() - gift.at) / 1000 : -1;
    const on = g >= 0 && g < GIFT_T.leave + 0.2;
    if (root.current) root.current.visible = on;
    if (!on || !root.current) return;

    // walk in, stand and give, wave, walk out
    const walkIn = smooth(g / GIFT_T.walkIn);
    const walkOut = smooth((g - GIFT_T.drink - 0.5) / (GIFT_T.leave - GIFT_T.drink - 0.5));
    const x = g < GIFT_T.drink ? offX + (standX - offX) * walkIn : standX + (offX - standX) * walkOut;
    const walking = (g < GIFT_T.walkIn) || (g > GIFT_T.drink + 0.5);
    root.current.position.set(x, groundY, Z.minimi + 0.9);
    if (bodyRef.current) {
      bodyRef.current.position.y = walking ? Math.abs(Math.sin(g * 9)) * 0.05 : 0;
      bodyRef.current.rotation.z = walking ? Math.sin(g * 9) * 0.05 : 0;
    }

    // the tray rises and reaches toward Minimi while giving
    const reach = smooth((g - GIFT_T.walkIn) / (GIFT_T.give - GIFT_T.walkIn - 0.2)) * (g < GIFT_T.give + 0.3 ? 1 : Math.max(0, 1 - (g - GIFT_T.give - 0.3) / 0.4));
    const tx = -0.12 - reach * 0.32, ty = 0.42 + reach * 0.22;
    if (trayRef.current) {
      trayRef.current.position.set(tx, ty + (walking ? Math.sin(g * 9) * 0.01 : 0), 0.04);
      trayRef.current.visible = g < GIFT_T.give + 0.6;
    }
    if (pawL.current) pawL.current.position.set(tx - 0.16, ty - 0.03, 0.05);
    if (pawR.current) {
      // after giving, the right paw waves goodbye
      const waving = g > GIFT_T.give + 0.6;
      pawR.current.position.set(waving ? 0.32 : tx + 0.16, waving ? 0.78 + Math.sin(g * 10) * 0.05 : ty - 0.03, 0.05);
    }
    if (pawL.current) pawL.current.visible = g < GIFT_T.give + 0.6;

    // the gift rides the tray, then floats over into Minimi's paws
    if (item.current) {
      item.current.visible = g < GIFT_T.give;
      const onTrayX = x + tx * HS, onTrayY = groundY + (ty + 0.02) * HS + (bodyRef.current?.position.y ?? 0) * HS;
      const k = smooth((g - (GIFT_T.give - 0.55)) / 0.55);
      v.set(onTrayX + (holdX - onTrayX) * k, onTrayY + (holdY - onTrayY) * k + Math.sin(k * Math.PI) * 0.12, Z.minimi + 0.95);
      item.current.position.copy(v);
    }
  });

  const tint = pal.tint;
  const itemArt = gift?.item === "matcha_latte" ? art.cup : art.box;
  return (
    <>
      <group ref={root} visible={false} scale={HS}>
        <Sprite art={art.shadow} position={[0.05, 0.0, -0.06]} scale={[0.8, 1, 1]} color="#000" opacity={pal.shadow} order={33} />
        <group ref={bodyRef}>
          <Sprite art={art.body} position={[0, -BODY_TEX.baseY, 0]} color={tint} order={34} />
          <group ref={trayRef}>
            <Sprite art={art.tray} color={tint} order={35} />
          </group>
          <group ref={pawL}><Sprite art={art.paw} color={tint} order={36} /></group>
          <group ref={pawR}><Sprite art={art.paw} color={tint} order={36} /></group>
        </group>
      </group>
      <group ref={item} visible={false} scale={ITEM_SCALE}>
        <Sprite art={itemArt} position={[0, 0.15, 0]} color={tint} order={37} />
      </group>
    </>
  );
}
