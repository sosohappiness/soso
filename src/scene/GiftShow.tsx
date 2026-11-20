import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GIFTS, pourWindow, type GiftId } from "../lib/gifts";
import { TUB, dropTex, giftItemTex, particleTex, tubBackTex, tubFrontTex, tubWaterTex } from "./props";
import { painted } from "../paint/painter";
import { Sprite } from "./Sprite";
import { Z } from "./Backdrop";
import type { Palette } from "./palette";
import type { Seat } from "./Minimi";
import { shadowTex } from "./animals";
import {
  PAWS_AT, SPOUT_FROM_PIVOT, SQ_BODY, SQ_TAIL, TAIL_TIP, TEAPOT_PIVOT,
  emptyCupTex, squirrelBodyTex, squirrelPawTex, squirrelTailTex, teapotTex,
} from "./squirrel";

// The gift friend: a squirrel hops in with a teapot held in its tail.
// · 말차라떼: pours tea into the cup in its paws, hands it over.
// · 떡볶이: brings a plate and hands it over.
// · 따뜻한 목욕: pushes in a big tub, fills it from the teapot; Minimi jumps in (Minimi.tsx).
// · 노래 듣기: sets a speaker down and plays a song.
// Then it waves its tail, turns around and hops off.

const HS = 1.3;
const MINIMI_SCALE = 1.12; // must match Minimi
const ITEM_SCALE = 1.3 * MINIMI_SCALE;
const PAW_ITEM_SCALE = 1.05;
const DROPS = 7;
const NOTES = 4;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

function streamArt(color: string) {
  return painted(`tea-stream-${color}`, 0.05, 1.0, (p) => {
    p.poly([[-0.014, 0.5], [0.014, 0.5], [0.011, -0.5], [-0.011, -0.5]], color, { wob: 0.002, fuzz: 0 });
  }, { grain: 0.02 });
}

type Props = {
  pal: Palette; seat: Seat; groundY: number; tubX: number;
  gift: { at: number; item: GiftId } | null;
};

export function GiftShow({ pal, seat, groundY, tubX, gift }: Props) {
  const art = useMemo(() => ({
    body: squirrelBodyTex(), tail: squirrelTailTex(), paw: squirrelPawTex(), teapot: teapotTex(),
    tea: streamArt("#9DB86A"), water: streamArt("#9FC8E6"), emptyCup: emptyCupTex(), shadow: shadowTex(),
    tubBack: tubBackTex(), tubWater: tubWaterTex(), tubFront: tubFrontTex(), drop: dropTex(), note: particleTex("note"),
  }), []);
  const id = gift?.item ?? null;
  const itemArt = useMemo(() => (id ? giftItemTex(id) : null), [id]);
  const kind = id ? GIFTS[id].kind : "hold";
  const T = id ? GIFTS[id].t : { walkIn: 0, give: 0, drink: 0, leave: 0 };
  const pour = id ? pourWindow(id) : null;
  const holdY = seat.y + (id === "tteok" ? 0.28 : 0.5) * MINIMI_SCALE;
  const standX = kind === "bath" ? tubX + 0.95 : kind === "music" ? seat.x + 1.0 : seat.x + 0.78;
  const offX = seat.x + 2.8;
  const speakerX = seat.x + 0.32;

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
  const tub = useRef<THREE.Group>(null);
  const water = useRef<THREE.Group>(null);
  const speaker = useRef<THREE.Group>(null);
  const drops = useRef<(THREE.Group | null)[]>([]);
  const notes = useRef<(THREE.Group | null)[]>([]);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const g = gift ? (performance.now() - gift.at) / 1000 : -1;
    const on = g >= 0 && g < T.leave + 0.3;
    for (const r of [root, tub, speaker, flying, stream]) if (r.current && !on) r.current.visible = false;
    if (!on || !root.current) {
      drops.current.forEach((d) => d && (d.visible = false));
      notes.current.forEach((n) => n && (n.visible = false));
      return;
    }
    root.current.visible = true;

    // hop in from the right, stand, then turn around and hop away
    const leaving = g > T.drink + 0.4;
    const inK = smooth(g / T.walkIn);
    const outK = smooth((g - T.drink - 0.4) / (T.leave - T.drink - 0.4));
    const x = leaving ? standX + (offX - standX) * outK : offX + (standX - offX) * inK;
    const moving = g < T.walkIn || leaving;
    const dancing = kind === "music" && g > T.give && g < T.drink;
    root.current.position.set(x, groundY, Z.minimi + 0.9);
    root.current.scale.set(leaving ? -HS : HS, HS, 1);
    if (hop.current) {
      hop.current.position.y = moving ? Math.abs(Math.sin(g * 7)) * 0.1 : dancing ? Math.abs(Math.sin(g * 6)) * 0.05 : 0;
      hop.current.rotation.z = moving ? Math.sin(g * 7) * 0.04 : dancing ? Math.sin(g * 3) * 0.06 : 0;
    }

    // tail and teapot: sway, tip forward while pouring, wave goodbye
    const pourK = pour ? Math.sin(Math.PI * smooth((g - pour[0]) / (pour[1] - pour[0]))) : 0;
    const pouring = !!pour && g > pour[0] + 0.2 && g < pour[1] - 0.15;
    if (tail.current) {
      const wave = g > T.give + 0.3 && !leaving ? Math.sin(g * 6) * 0.08 : 0;
      tail.current.rotation.z = Math.sin(g * 2.2) * 0.03 + pourK * 0.06 + wave;
    }
    if (pot.current) {
      const swing = moving ? Math.sin(g * 7 + 1) * 0.12 : Math.sin(g * 2) * 0.04;
      pot.current.rotation.z = swing + pourK * 0.75;
    }

    // what the paws hold
    const handsOff = kind === "hold" ? g >= T.give - 0.55 : kind === "music" ? g >= T.walkIn + 0.3 && !leaving : true;
    if (inPaws.current) inPaws.current.visible = !handsOff;
    if (emptyRef.current) emptyRef.current.visible = id === "matcha" && !!pour && g < pour[1] - 0.1;
    if (fullRef.current) fullRef.current.visible = id !== "matcha" || (!!pour && g >= pour[1] - 0.1);

    // the bath tub rolls in beside the squirrel and fills up
    let waterY = groundY + 0.1;
    if (tub.current) {
      tub.current.visible = kind === "bath";
      tub.current.position.set(x - (standX - tubX), groundY, Z.minimi + 0.55);
      if (kind === "bath" && pour) {
        const level = smooth((g - pour[0] - 0.2) / (pour[1] - pour[0] - 0.2));
        const inTub = g > T.give && g < T.drink ? 0.025 : 0;
        waterY = groundY + 0.12 + level * 0.4 + inTub;
        if (water.current) {
          water.current.visible = level > 0.03;
          water.current.position.set(0, waterY - groundY, 0.01);
        }
      }
    }

    // the stream from the spout: into the cup (matcha) or into the tub (bath)
    if (stream.current && spout.current) {
      stream.current.visible = pouring;
      if (pouring) {
        spout.current.getWorldPosition(a);
        let bottom = waterY;
        if (id === "matcha" && inPaws.current) {
          inPaws.current.getWorldPosition(b);
          bottom = b.y + 0.15 * PAW_ITEM_SCALE * HS;
        }
        const len = Math.max(0.05, a.y - bottom);
        stream.current.position.set(a.x, bottom + len / 2, Z.minimi + 0.92);
        stream.current.scale.set(1, len, 1);
      }
    }

    // splash when Minimi lands in the water
    drops.current.forEach((d, i) => {
      if (!d) return;
      const s = (g - T.give) / 0.9;
      d.visible = kind === "bath" && s > 0 && s < 1;
      const ang = Math.PI * (0.15 + (i / (DROPS - 1)) * 0.7);
      d.position.set(tubX + Math.cos(ang) * 0.75 * s, waterY + Math.sin(ang) * 0.9 * s - 1.4 * s * s, Z.minimi + 0.97);
    });

    // the speaker: carried in, set down, plays, carried out
    if (speaker.current) {
      speaker.current.visible = kind === "music" && g >= T.walkIn + 0.3 && !leaving;
      const beat = dancing ? 1 + Math.max(0, Math.sin(g * 8)) * 0.06 : 1;
      speaker.current.position.set(speakerX, groundY, Z.minimi + 0.85);
      speaker.current.scale.set(PAW_ITEM_SCALE * HS * beat, PAW_ITEM_SCALE * HS * (2 - beat), 1);
    }
    notes.current.forEach((n, i) => {
      if (!n) return;
      const p = ((g - T.give) * 0.4 + i / NOTES) % 1;
      n.visible = dancing;
      n.position.set(speakerX - 0.1 - p * 0.55 + Math.sin(p * 7 + i) * 0.08, groundY + 0.45 + p * 1.4, Z.minimi + 0.95);
      n.rotation.z = Math.sin(p * 6 + i) * 0.3;
      n.scale.setScalar(1.2 + p * 0.6);
    });

    // hand-over: the cup or plate floats from the squirrel's paws into Minimi's
    if (flying.current && inPaws.current) {
      const k = smooth((g - (T.give - 0.55)) / 0.55);
      flying.current.visible = kind === "hold" && g >= T.give - 0.55 && g < T.give;
      inPaws.current.getWorldPosition(a);
      flying.current.position.set(a.x + (seat.x - a.x) * k, a.y + (holdY - a.y) * k + Math.sin(k * Math.PI) * 0.15, Z.minimi + 0.95);
    }
  });

  const tint = pal.tint;
  return (
    <>
      <group ref={tub} visible={false}>
        <Sprite art={art.tubBack} position={[0, TUB.h / 2 - 0.02, 0]} color={tint} order={19.4} />
        <group ref={water} visible={false}>
          <Sprite art={art.tubWater} color={tint} opacity={0.85} order={32.2} />
        </group>
        <Sprite art={art.tubFront} position={[0, TUB.h / 2 - 0.02, 0.02]} color={tint} order={32.5} />
      </group>
      <group ref={speaker} visible={false}>
        {kind === "music" && itemArt && <Sprite art={itemArt} position={[0, 0.15, 0]} color={tint} order={32.8} />}
      </group>
      <group ref={root} visible={false}>
        <Sprite art={art.shadow} position={[0.08, 0.0, -0.06]} scale={[0.7, 1, 1]} color="#000" opacity={pal.shadow} order={33} />
        <group ref={hop}>
          <group ref={tail} position={[0.18, 0.12, -0.01]}>
            <Sprite art={art.tail} position={[SQ_TAIL.at[0] - 0.18, SQ_TAIL.at[1] - 0.12, 0]} color={tint} order={34} />
            <group ref={pot} position={[TAIL_TIP[0] - 0.18, TAIL_TIP[1] - 0.12, 0.02]}>
              <Sprite art={art.teapot} pivot={TEAPOT_PIVOT} color={tint} order={35} />
              <group ref={spout} position={[SPOUT_FROM_PIVOT[0], SPOUT_FROM_PIVOT[1], 0]} />
            </group>
          </group>
          <Sprite art={art.body} position={[0, -SQ_BODY.feetY, 0]} color={tint} order={36} />
          <group ref={inPaws} position={[PAWS_AT[0], PAWS_AT[1] - 0.15 * PAW_ITEM_SCALE + 0.02, 0.03]} scale={PAW_ITEM_SCALE}>
            <group ref={emptyRef}><Sprite art={art.emptyCup} position={[0, 0.15, 0]} color={tint} order={37} /></group>
            <group ref={fullRef}>{itemArt && <Sprite art={itemArt} position={[0, 0.15, 0]} color={tint} order={37} />}</group>
          </group>
          <Sprite art={art.paw} position={[PAWS_AT[0] + 0.02, PAWS_AT[1] - 0.03, 0.05]} color={tint} order={38} />
        </group>
      </group>
      <group ref={stream} visible={false}>
        <Sprite art={id === "bath" ? art.water : art.tea} color={tint} order={36.5} />
      </group>
      <group ref={flying} visible={false} scale={ITEM_SCALE}>
        {kind === "hold" && itemArt && <Sprite art={itemArt} position={[0, 0.15, 0]} color={tint} order={39} />}
      </group>
      {Array.from({ length: DROPS }, (_, i) => (
        <Sprite key={`d${i}`} ref={(r) => { drops.current[i] = r; }} art={art.drop} color={tint} order={39} visible={false} />
      ))}
      {Array.from({ length: NOTES }, (_, i) => (
        <Sprite key={`n${i}`} ref={(r) => { notes.current[i] = r; }} art={art.note} order={39} visible={false} />
      ))}
    </>
  );
}
