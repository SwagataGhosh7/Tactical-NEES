"use client";

import { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useTacticalStore } from "@/state/useTacticalStore";
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
const SCALE = 1 / 7000;

const GROUP_COLOR: Record<string, number[]> = {
  starlink: [0, 1, 1], // Neon cyan
  "gps-ops": [1, 0, 1], // Neon magenta
  active: [0.6, 0.6, 0.6],
  weather: [0, 1, 0.5], // Neon green
  science: [0.6, 0.2, 1], // Neon purple
  stations: [1, 0, 0.5], // Neon pink
};

function propagateSimple(sat: TleDto, now: Date): THREE.Vector3 | null {
  try {
    const epochMs = new Date(sat.epoch).getTime();
    const dtDays = (now.getTime() - epochMs) / 86400000;
    const n = sat.meanMotion * 2 * Math.PI;
    const ma = ((sat.meanAnomaly * Math.PI) / 180 + n * dtDays) % (2 * Math.PI);
    const a = Math.pow(8683313.0 / (n * n), 1 / 3);
    const e = Math.min(Math.max(sat.eccentricity, 0), 0.99);
    const E = solveKepler(ma, e);
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    const r = a * (1 - e * Math.cos(E));
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);

    const i = (sat.inclination * Math.PI) / 180;
    const raan = (sat.raan * Math.PI) / 180;
    const arg = (sat.argOfPerigee * Math.PI) / 180;

    const cosRaan = Math.cos(raan), sinRaan = Math.sin(raan);
    const cosArg = Math.cos(arg), sinArg = Math.sin(arg);
    const cosI = Math.cos(i), sinI = Math.sin(i);

    const x = xOrb * (cosRaan * cosArg - sinRaan * sinArg * cosI) - yOrb * (cosRaan * sinArg + sinRaan * cosArg * cosI);
    const y = xOrb * (sinRaan * cosArg + cosRaan * sinArg * cosI) - yOrb * (sinRaan * sinArg - cosRaan * cosArg * cosI);
    const z = xOrb * sinArg * sinI + yOrb * cosArg * sinI;

    return new THREE.Vector3(x, z, -y).multiplyScalar(SCALE);
  } catch {
    return null;
  }
}

function solveKepler(M: number, e: number, eps = 1e-7): number {
  let E = M;
  for (let i = 0; i < 30; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < eps) break;
  }
  return E;
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
    if (!layers.otherSats) list = list.filter((s) => !["weather", "science", "stations", "active"].includes(s.group));
    return list.slice(0, 2000);
  }, [catalog, layers]);

  const geometry = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    for (const s of filtered) {
      const p = propagateSimple(s, now);
      if (!p) continue;
      pos.push(p.x, p.y, p.z);
      const c = GROUP_COLOR[s.group] ?? GROUP_COLOR.active;
      col.push(...c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return geo;
  }, [filtered, now]);

  const issPos = useMemo(() => {
    if (!iss || !layers.iss) return null;
    if (!iss.latitude || !iss.longitude) return null;
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
      <points geometry={geometry}>
        <pointsMaterial vertexColors size={0.055} transparent opacity={0.9} sizeAttenuation toneMapped={false} />
      </points>
      {issPos && (
        <mesh position={issPos}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#00ffff" toneMapped={false} />
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
