import { forwardRef, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { Painted } from "../paint/painter";

type Props = {
  art: Painted;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
  opacity?: number;
  order?: number;
  /** Shift the plane so this point (in art units, from centre) sits on the origin. */
  pivot?: [number, number];
  visible?: boolean;
};

/** A flat painted cutout: one plane, one canvas texture, no lighting. */
export const Sprite = forwardRef<THREE.Group, Props>(function Sprite(
  { art, position, scale, color = "#ffffff", opacity = 1, order = 0, pivot = [0, 0], visible = true },
  ref,
) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useLayoutEffect(() => {
    mat.current?.color.set(color);
  }, [color]);
  return (
    <group ref={ref} position={position} scale={scale} visible={visible}>
      <mesh position={[-pivot[0], -pivot[1], 0]} renderOrder={order}>
        <planeGeometry args={[art.w, art.h]} />
        <meshBasicMaterial
          ref={mat}
          map={art.tex}
          transparent
          opacity={opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
});
