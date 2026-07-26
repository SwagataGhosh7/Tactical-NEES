"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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

const GROUP_COLORS: Record<string, THREE.Color> = {
  starlink: new THREE.Color("#ffb000"),
  "gps-ops": new THREE.Color("#00e5ff"),
  active: new THREE.Color("#a0a0a0"),
  weather: new THREE.Color("#4ade80"),
  science: new THREE.Color("#c084fc"),
  stations: new THREE.Color("#ffffff"),
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
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const filtered = useMemo(() => {
    let list = catalog;
    if (!layers.starlink) list = list.filter((s) => !s.group.includes("starlink"));
    if (!layers.gps) list = list.filter((s) => !s.group.includes("gps"));
    if (!layers.otherSats) list = list.filter((s) => !["weather", "science", "stations", "active"].includes(s.group));
    return list.slice(0, 5000);
  }, [catalog, layers]);

  const { matrices, colors } = useMemo(() => {
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    const scl = new THREE.Vector3(1, 1, 1);
    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    for (const s of filtered) {
      const p = propagateSimple(s, now);
      if (!p) continue;
      pos.copy(p);
      m.compose(pos, rot, scl);
      matrices.push(m.clone());
      colors.push(GROUP_COLORS[s.group] ?? GROUP_COLORS.active);
    }
    return { matrices, colors };
  }, [filtered, now]);

  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < matrices.length; i++) {
      dummy.position.setFromMatrixPosition(matrices[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.count = matrices.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

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
      <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {issPos && (
        <mesh position={issPos}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#00e5ff" toneMapped={false} />
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
