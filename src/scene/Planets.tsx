"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const planets = [
  { name: "Mercury", dist: 5.5, size: 0.25, color: "#a0a0a0", speed: 4.1, texture: 'rocky' },
  { name: "Venus", dist: 8, size: 0.45, color: "#d4a373", speed: 1.6, texture: 'atmosphere' },
  { name: "Earth", dist: 11, size: 0.48, color: "#00aaff", speed: 1.0, texture: 'earth' },
  { name: "Mars", dist: 14, size: 0.35, color: "#ff5533", speed: 0.53, texture: 'rocky' },
  { name: "Jupiter", dist: 20, size: 1.1, color: "#cc9966", speed: 0.08, texture: 'gas' },
  { name: "Saturn", dist: 27, size: 0.95, color: "#e0c896", speed: 0.03, texture: 'gas', hasRings: true },
];

function createPlanetTexture(type: string, baseColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (type === 'gas') {
      // Add bands for gas giants
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 50 + 100}, ${Math.random() * 50 + 80}, ${Math.random() * 50 + 60}, 0.3)`;
        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 10 + Math.random() * 20);
      }
    } else if (type === 'rocky') {
      // Add craters/surface details
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.2)`;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 5 + Math.random() * 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'atmosphere') {
      // Add cloud patterns
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 20 + Math.random() * 40;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  return new THREE.CanvasTexture(canvas);
}

function Planet({ planet }: { planet: typeof planets[0] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  const texture = useMemo(() => createPlanetTexture(planet.texture, planet.color), [planet.texture, planet.color]);
  
  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * planet.speed * 0.1;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (ringRef.current && planet.hasRings) {
      ringRef.current.rotation.z += delta * 0.1;
    }
  });
  
  return (
    <group ref={orbitRef}>
      {/* Orbital path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.dist - 0.02, planet.dist + 0.02, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Planet */}
      <mesh ref={meshRef} position={[planet.dist, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.1}
          emissive={planet.color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Saturn's rings */}
      {planet.hasRings && (
        <mesh ref={ringRef} position={[planet.dist, 0, 0]} rotation={[Math.PI / 2.5, 0, 0]} castShadow receiveShadow>
          <ringGeometry args={[planet.size * 1.4, planet.size * 2.2, 64]} />
          <meshStandardMaterial
            color="#c9b896"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export function Planets() {
  return (
    <group>
      {planets.map((planet) => (
        <Planet key={planet.name} planet={planet} />
      ))}
    </group>
  );
}
