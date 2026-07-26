"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
    if (wireRef.current) wireRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#0a1a2a"
          emissive="#001a33"
          emissiveIntensity={0.4}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <mesh ref={wireRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ffb000" wireframe transparent opacity={0.18} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ff7a00" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Equatorial ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.32, 128]} />
        <meshBasicMaterial color="#ffb000" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
