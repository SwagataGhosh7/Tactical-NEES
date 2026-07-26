"use client";

import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import * as THREE from "three";
import { getSpacecraftPositions, type SpacecraftDto } from "@/lib/feeds/horizons.functions";
import { useTacticalStore } from "@/state/useTacticalStore";

const scQueryOptions = queryOptions({
  queryKey: ["spacecraft"],
  queryFn: () => getSpacecraftPositions(),
  staleTime: 1000 * 60 * 15,
});

export function Spacecraft() {
  const layers = useTacticalStore((s) => s.layers);
  const { data } = useSuspenseQuery(scQueryOptions);
  if (!layers.spacecraft || !data) return null;

  return (
    <group>
      {data.map((sc) => (
        <SCMarker key={sc.id} sc={sc} />
      ))}
    </group>
  );
}

function SCMarker({ sc }: { sc: SpacecraftDto }) {
  const pos = new THREE.Vector3(sc.x, sc.z, -sc.y).multiplyScalar(8);
  return (
    <mesh position={pos}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshBasicMaterial color="#00e5ff" />
    </mesh>
  );
}
