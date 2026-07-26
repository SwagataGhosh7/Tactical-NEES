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
  const dir = useMemo(() => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    ).normalize();
  }, [neo.id]);

  const length = Math.max(2, 5 - neo.missDistanceAu * 60);
  const color = neo.hazardous ? "#ff2a2a" : neo.missDistanceAu < 0.01 ? "#ff7a00" : "#ffb000";
  const start = dir.clone().multiplyScalar(2.2 + length * 0.5);
  const end = dir.clone().multiplyScalar(2.2);

  return (
    <group>
      <primitive object={new THREE.ArrowHelper(dir, start, length, color, 0.25, 0.12)} />
      <mesh position={end}>
        <sphereGeometry args={[0.04 + neo.diameterMaxM / 2000, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
