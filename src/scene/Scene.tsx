"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useTacticalStore } from "@/state/useTacticalStore";
import { Earth } from "./Earth";
import { Sun } from "./Sun";
import { Planets } from "./Planets";
import { Starfield } from "./Starfield";
import { SatelliteSwarm } from "./SatelliteSwarm";
import { NeoVectors } from "./NeoVectors";
import { Spacecraft } from "./Spacecraft";
import { SolarWind } from "./SolarWind";

export function TacticalScene() {
  const view = useTacticalStore((s) => s.view);
  const isGeo = view === "geocentric";

  return (
    <Canvas
      camera={{ position: isGeo ? [0, 0, 12] : [0, 15, 35], fov: 55 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      shadows
      className="!fixed inset-0 !h-screen !w-screen"
    >
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.05} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffb000" />
      <Stars radius={300} depth={60} count={4000} factor={4} saturation={0} fade speed={1} />
      <Starfield />

      {isGeo ? (
        <group>
          <Earth />
          <SatelliteSwarm />
          <NeoVectors />
        </group>
      ) : (
        <group>
          <Sun />
          <Planets />
          <Spacecraft />
          <SolarWind />
        </group>
      )}

      <OrbitControls
        enablePan={false}
        minDistance={isGeo ? 4 : 10}
        maxDistance={isGeo ? 60 : 120}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </Canvas>
  );
}
