"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial color="#ffb000" />
      </mesh>
      <mesh scale={[3.5, 3.5, 3.5]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ff7a00" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffb000" distance={200} />
    </group>
  );
}
