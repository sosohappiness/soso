import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "../lib/time";
import type { Growth } from "../lib/demo";
import { Backdrop } from "./Backdrop";
import { CloudFlower } from "./CloudFlower";
import { Minimi } from "./Minimi";
import { paletteFor, type SceneId } from "./palette";
import { Sofa, SOFA_SEAT } from "./Sofa";
import { MeadowLife } from "./MeadowLife";
import { GiftShow } from "./GiftShow";
import { GROUND_SEAT } from "./Minimi";
import type { GiftId } from "../lib/gifts";
import type { AnimalId } from "./animals";

const FOV = 30;
const FRAME_W = 4.3; // world width that must always be visible (tree + Minimi)
const FRAME_H = 8.6;
const HORIZON = 0.6;

/**
 * Orbits the camera around the scene centre. `view.yaw/pitch` are the user's targets in
 * radians (rotate button / drag); the camera eases toward them.
 */
function CameraRig({ view }: { view: RefObject<{ yaw: number; pitch: number }> }) {
  const { camera, size } = useThree();
  const cur = useRef({ yaw: 0, pitch: 0 });
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const dist = Math.max(FRAME_W / 2 / (tan * aspect), FRAME_H / 2 / tan);
    const visH = 2 * dist * tan;
    // put the horizon ~62% of the way down the screen, like the mockup
    const ty = HORIZON + 0.12 * visH;
    const k = 1 - Math.exp(-dt * 3);
    const v = view.current ?? { yaw: 0, pitch: 0 };
    cur.current.yaw += (v.yaw - cur.current.yaw) * k;
    cur.current.pitch += (v.pitch - cur.current.pitch) * k;
    const { yaw, pitch } = cur.current;
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, ty + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.lookAt(0, ty, 0);
    if (cam.fov !== FOV) {
      cam.fov = FOV;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

/** Moves the HTML speech bubble so it follows Minimi's head on screen. */
function BubbleTracker({ anchor, el }: { anchor: THREE.Vector3; el: RefObject<HTMLDivElement> }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!el.current) return;
    v.copy(anchor).add({ x: 0.1, y: 0.18, z: 0 } as THREE.Vector3).project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    // keep the whole bubble on screen; the tail still points at Minimi
    const w = (el.current.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    const pad = 14;
    const bx = Math.min(Math.max(x, w / 2 + pad), size.width - w / 2 - pad);
    el.current.style.transform = `translate(${bx.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.current.style.setProperty("--tail", `${(x - bx).toFixed(1)}px`);
  });
  return null;
}

type Props = {
  phase: Phase;
  animal: AnimalId;
  growth: Growth;
  view: RefObject<{ yaw: number; pitch: number }>;
  bubble: RefObject<HTMLDivElement>;
  pokeAt: number;
  onPoke: () => void;
  scene: SceneId;
  gift: { at: number; item: GiftId } | null;
};

export function Scene({ phase, animal, growth, view, bubble, pokeAt, onPoke, scene, gift }: Props) {
  const pal = paletteFor(scene, phase);
  const anchor = useMemo(() => new THREE.Vector3(), []);
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 2, 16] }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={[pal.sky]} />
      <CameraRig view={view} />
      <Backdrop phase={phase} pal={pal} />
      <CloudFlower pal={pal} growth={growth} night={phase === "night"} />
      {scene === "sofa" && <Sofa pal={pal} />}
      {scene === "sofa" && <MeadowLife pal={pal} />}
      <Minimi animal={animal} phase={phase} pal={pal} anchor={anchor} pokeAt={pokeAt} onPoke={onPoke} seat={scene === "sofa" ? SOFA_SEAT : undefined} gift={gift} />
      <GiftShow pal={pal} seat={scene === "sofa" ? SOFA_SEAT : GROUND_SEAT} groundY={scene === "sofa" ? -0.32 : GROUND_SEAT.y - 0.15} gift={gift} />
      <BubbleTracker anchor={anchor} el={bubble} />
    </Canvas>
  );
}
