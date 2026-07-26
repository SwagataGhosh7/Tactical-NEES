"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSolarWind, type SolarWindDto } from "@/lib/feeds/spaceweather.functions";
import { useTacticalStore } from "@/state/useTacticalStore";

const swQueryOptions = queryOptions({
  queryKey: ["solarwind"],
  queryFn: () => getSolarWind(),
  staleTime: 1000 * 60 * 5,
  refetchInterval: 1000 * 60 * 5,
});

export function SolarWind() {
  const layers = useTacticalStore((s) => s.layers);
  const { data } = useSuspenseQuery(swQueryOptions);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const speed = data?.speed ? data.speed / 450 : 1;
    const t = state.clock.elapsedTime * speed;
    const s = 1 + (t % 1) * 4;
    ringRef.current.scale.setScalar(s);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.25 * (1 - (t % 1));
  });

  if (!layers.solarWind) return null;

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[4, 4.2, 128]} />
      <meshBasicMaterial color="#ffb000" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}
