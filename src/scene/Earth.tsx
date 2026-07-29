"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Create procedural Earth texture
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Ocean base
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a4a6e');
      gradient.addColorStop(0.5, '#0d3b5c');
      gradient.addColorStop(1, '#1a4a6e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add continents (simplified procedural)
      ctx.fillStyle = '#2d5a3d';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 30 + Math.random() * 80;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add some ice caps
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create clouds texture
  const cloudsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add cloud patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 20 + Math.random() * 60;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.07;
  });

  return (
    <group>
      {/* Earth sphere with realistic texture */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.6}
          metalness={0.1}
          emissive="#001a33"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          roughness={1}
          metalness={0}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4a90d9"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer atmosphere glow */}
      <mesh scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
