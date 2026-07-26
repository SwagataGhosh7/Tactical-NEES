"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function Starfield() {
  const points = useMemo(() => {
    const arr = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
          count={points.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffb000" size={0.08} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}
