"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { useTacticalStore } from "@/state/useTacticalStore";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSatelliteCatalog, type TleDto } from "@/lib/feeds/tle.functions";
import { getIssPosition } from "@/lib/feeds/iss.functions";

const tleQueryOptions = queryOptions({
  queryKey: ["tles"],
  queryFn: () => getSatelliteCatalog(),
  staleTime: 1000 * 60 * 60,
});

const issQueryOptions = queryOptions({
  queryKey: ["iss"],
  queryFn: () => getIssPosition(),
  staleTime: 5000,
  refetchInterval: 5000,
});

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 10000; // 1 unit = 10000 km

function satPosition(tle: TleDto, now: Date): THREE.Vector3 | null {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const pv = satellite.propagate(satrec, now);
    if (!pv || !pv.position || typeof pv.position === "boolean") return null;
    const p = pv.position as satellite.EciVec3<number>;
    return new THREE.Vector3(p.x, p.z, -p.y).multiplyScalar(SCALE);
  } catch {
    return null;
  }
}

export function SatelliteSwarm() {
  const layers = useTacticalStore((s) => s.layers);
  const { data: catalog } = useSuspenseQuery(tleQueryOptions);
  const { data: iss } = useSuspenseQuery(issQueryOptions);
  const now = useNow();

  const filtered = useMemo(() => {
    let list = catalog;
    if (!layers.starlink) list = list.filter((s) => !s.group.includes("starlink"));
    if (!layers.gps) list = list.filter((s) => !s.group.includes("gps"));
    if (!layers.otherSats) list = list.filter((s) => ["starlink", "gps-ops", "active"].includes(s.group));
    return list.slice(0, 5000);
  }, [catalog, layers]);

  const positions = useMemo(() => {
    const arr: number[] = [];
    for (const s of filtered) {
      const pos = satPosition(s, now);
      if (pos) arr.push(pos.x, pos.y, pos.z);
    }
    return new Float32Array(arr);
  }, [filtered, now]);

  const issPos = useMemo(() => {
    if (!iss || !layers.iss) return null;
    const latRad = (iss.latitude * Math.PI) / 180;
    const lonRad = (iss.longitude * Math.PI) / 180;
    const r = (EARTH_RADIUS_KM + iss.altitudeKm) * SCALE;
    const x = r * Math.cos(latRad) * Math.cos(lonRad);
    const y = r * Math.sin(latRad);
    const z = -r * Math.cos(latRad) * Math.sin(lonRad);
    return new THREE.Vector3(x, y, z);
  }, [iss, layers.iss]);

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={positions.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial color="#ffb000" size={0.045} transparent opacity={0.85} sizeAttenuation />
      </points>
      {issPos && (
        <mesh position={issPos}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
      )}
    </group>
  );
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
