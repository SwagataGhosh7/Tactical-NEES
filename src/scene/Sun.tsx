"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  
  // Create sun surface texture
  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Base gradient
      const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
      gradient.addColorStop(0, '#fff5e0');
      gradient.addColorStop(0.3, '#ffcc00');
      gradient.addColorStop(0.6, '#ff9900');
      gradient.addColorStop(1, '#ff6600');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add solar granulation effect
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, 0.3)`;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 5 + Math.random() * 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      ref.current.scale.setScalar(s);
    }
    if (coronaRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      coronaRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* Sun surface */}
      <mesh ref={ref}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial map={sunTexture} color="#ffb000" />
      </mesh>
      
      {/* Inner corona */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#ff7a00" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer corona */}
      <mesh ref={coronaRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#ff5500" 
          transparent 
          opacity={0.08} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Sun light */}
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffcc00" distance={300} />
      <ambientLight intensity={0.1} color="#ffaa00" />
    </group>
  );
}
