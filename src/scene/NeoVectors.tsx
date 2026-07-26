"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getNeoFeed, type NeoDto } from "@/lib/feeds/neo.functions";
import { useTacticalStore } from "@/state/useTacticalStore";

const neoQueryOptions = queryOptions({
  queryKey: ["neos"],
  queryFn: () => getNeoFeed(),
  staleTime: 1000 * 60 * 60,
});

export function NeoVectors() {
  const layers = useTacticalStore((s) => s.layers);
  const maxMiss = useTacticalStore((s) => s.maxMissDistanceAu);
  const minDia = useTacticalStore((s) => s.minDiameterM);
  const { data } = useSuspenseQuery(neoQueryOptions);

  const filtered = useMemo(
    () =>
      (data || [])
        .filter((n) => n.approachBody === "Earth")
        .filter((n) => n.missDistanceAu <= maxMiss)
        .filter((n) => n.diameterMinM >= minDia)
        .slice(0, 64),
    [data, maxMiss, minDia]
  );

  if (!layers.neos) return null;

  return (
    <group>
      {filtered.map((neo) => (
        <NeoArrow key={neo.id} neo={neo} />
      ))}
    </group>
  );
}

function NeoArrow({ neo }: { neo: NeoDto }) {
  const { dir, length, color, headSize, start, end } = useMemo(() => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    ).normalize();

    const miss = Math.max(0.001, neo.missDistanceAu);
    const len = Math.min(6, Math.max(1.2, 1.5 / Math.sqrt(miss)));
    const col = neo.hazardous ? "#ff2a2a" : neo.missDistanceAu < 0.01 ? "#ff7a00" : "#ffb000";
    const hs = Math.min(0.18, 0.06 + len * 0.02);
    const s = direction.clone().multiplyScalar(1.6 + len * 0.35);
    const e = direction.clone().multiplyScalar(1.6);
    return { dir: direction, length: len, color: col, headSize: hs, start: s, end: e };
  }, [neo.id, neo.missDistanceAu, neo.hazardous]);

  return (
    <group>
      <primitive object={new THREE.ArrowHelper(dir, start, length, color, headSize, headSize * 0.6)} />
      <mesh position={end}>
        <sphereGeometry args={[0.03 + Math.min(0.12, neo.diameterMaxM / 5000), 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
