"use client";

import * as THREE from "three";

const planets = [
  { name: "Mercury", dist: 5.5, size: 0.25, color: "#a0a0a0" },
  { name: "Venus", dist: 8, size: 0.45, color: "#d4a373" },
  { name: "Earth", dist: 11, size: 0.48, color: "#00aaff" },
  { name: "Mars", dist: 14, size: 0.35, color: "#ff5533" },
  { name: "Jupiter", dist: 20, size: 1.1, color: "#cc9966" },
  { name: "Saturn", dist: 27, size: 0.95, color: "#e0c896" },
];

export function Planets() {
  return (
    <group>
      {planets.map((p) => (
        <group key={p.name}>
          <mesh position={[p.dist, 0, 0]}>
            <sphereGeometry args={[p.size, 32, 32]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.15} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.dist - 0.02, p.dist + 0.02, 128]} />
            <meshBasicMaterial color="#ffb000" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
