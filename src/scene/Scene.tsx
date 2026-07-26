"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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
      gl={{ antialias: true, alpha: false }}
      className="!fixed inset-0 !h-screen !w-screen"
    >
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffb000" />
      <Stars radius={300} depth={60} count={5000} factor={4} saturation={0} fade speed={1} />
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
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
