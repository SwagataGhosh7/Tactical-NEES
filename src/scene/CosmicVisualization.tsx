"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";

// Cosmic scene types based on distance
type CosmicScale = "solar-system" | "interstellar" | "galaxy" | "universe";

interface CosmicVisualizationProps {
  distance: number;
  onClose: () => void;
}

function getScaleFromDistance(distance: number): CosmicScale {
  if (distance < 100) return "solar-system";
  if (distance < 10000) return "interstellar";
  if (distance < 100000) return "galaxy";
  return "universe";
}

function SolarSystemScene() {
  const sunRef = useRef<THREE.Mesh>(null);
  const planetsRef = useRef<THREE.Group>(null);
  
  const planets = [
    { name: "Mercury", distance: 2, size: 0.1, color: 0x8c8c8c, speed: 4.1 },
    { name: "Venus", distance: 3, size: 0.15, color: 0xe6c87a, speed: 1.6 },
    { name: "Earth", distance: 4, size: 0.16, color: 0x6b93d6, speed: 1.0 },
    { name: "Mars", distance: 5, size: 0.12, color: 0xc1440e, speed: 0.53 },
    { name: "Jupiter", distance: 8, size: 0.5, color: 0xd8ca9d, speed: 0.08 },
    { name: "Saturn", distance: 11, size: 0.4, color: 0xf4d59e, speed: 0.03, hasRings: true },
  ];

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (planetsRef.current) {
      planetsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={planetsRef}>
      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={0xffdd00} />
        <pointLight intensity={2} distance={20} />
      </mesh>

      {/* Planets */}
      {planets.map((planet) => (
        <group key={planet.name} position={[planet.distance, 0, 0]}>
          <Float speed={planet.speed * 0.1} rotationIntensity={0.2}>
            <mesh>
              <sphereGeometry args={[planet.size, 16, 16]} />
              <meshStandardMaterial color={planet.color} />
            </mesh>
            {planet.hasRings && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[planet.size * 1.5, planet.size * 2, 32]} />
                <meshBasicMaterial color={0xc9b896} side={THREE.DoubleSide} transparent opacity={0.7} />
              </mesh>
            )}
          </Float>
        </group>
      ))}

      {/* Asteroid Belt */}
      <group>
        {Array.from({ length: 200 }).map((_, i) => {
          const angle = (i / 200) * Math.PI * 2;
          const radius = 6 + Math.random() * 1;
          return (
            <mesh key={i} position={[Math.cos(angle) * radius, (Math.random() - 0.5) * 0.2, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshBasicMaterial color={0x666666} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function InterstellarScene() {
  const nebulaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={nebulaRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#ff00ff" />
      <Sparkles count={150} scale={15} size={3} speed={0.3} opacity={0.3} color="#00ffff" />
      
      {/* Nebula clouds */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 50
        ]}>
          <sphereGeometry args={[5 + Math.random() * 10, 16, 16]} />
          <meshBasicMaterial 
            color={Math.random() > 0.5 ? 0xff00ff : 0x00ffff}
            transparent 
            opacity={0.1}
          />
        </mesh>
      ))}

      {/* Bright stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 80
        ]}>
          <sphereGeometry args={[0.2 + Math.random() * 0.3, 8, 8]} />
          <meshBasicMaterial color={0xffffff} />
          <pointLight intensity={0.5} distance={5} />
        </mesh>
      ))}
    </group>
  );
}

function GalaxyScene() {
  const galaxyRef = useRef<THREE.Group>(null);
  const armCount = 4;

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0001;
    }
  });

  const createSpiralArm = (armIndex: number) => {
    const stars = [];
    const armOffset = (armIndex / armCount) * Math.PI * 2;
    
    for (let i = 0; i < 500; i++) {
      const distance = 5 + (i / 500) * 45;
      const angle = armOffset + (i / 500) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * (5 + distance * 0.1);
      
      stars.push({
        position: [
          Math.cos(angle) * distance + spread,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * distance + spread
        ],
        size: 0.1 + Math.random() * 0.2,
        color: distance < 15 ? 0xffffaa : distance < 30 ? 0xffaa88 : 0x8888ff
      });
    }
    return stars;
  };

  const allStars = Array.from({ length: armCount }).flatMap((_, i) => createSpiralArm(i));

  return (
    <group ref={galaxyRef}>
      {/* Galactic core */}
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={0xffdd88} transparent opacity={0.3} />
      </mesh>
      <pointLight intensity={3} distance={50} color={0xffdd88} />

      {/* Spiral arms */}
      {allStars.map((star, i) => (
        <mesh key={i} position={star.position as [number, number, number]}>
          <sphereGeometry args={[star.size, 4, 4]} />
          <meshBasicMaterial color={star.color} />
        </mesh>
      ))}

      {/* Background stars */}
      <Stars radius={150} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
      
      {/* Globular clusters */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 80
        ]}>
          {Array.from({ length: 100 }).map((_, j) => (
            <mesh key={j} position={[
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5
            ]}>
              <sphereGeometry args={[0.05, 4, 4]} />
              <meshBasicMaterial color={0xffffcc} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function UniverseScene() {
  const universeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (universeRef.current) {
      universeRef.current.rotation.y += 0.00005;
    }
  });

  // Create galaxy clusters
  const createGalaxyCluster = (clusterIndex: number) => {
    const galaxies = [];
    const clusterCenter = [
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    ];
    
    for (let i = 0; i < 20; i++) {
      const distance = Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      
      galaxies.push({
        position: [
          clusterCenter[0] + Math.cos(angle) * distance,
          clusterCenter[1] + (Math.random() - 0.5) * 10,
          clusterCenter[2] + Math.sin(angle) * distance
        ],
        size: 1 + Math.random() * 2,
        color: [0xff6666, 0x66ff66, 0x6666ff, 0xffff66, 0xff66ff][Math.floor(Math.random() * 5)]
      });
    }
    return galaxies;
  };

  const allGalaxies = Array.from({ length: 8 }).flatMap((_, i) => createGalaxyCluster(i));

  return (
    <group ref={universeRef}>
      {/* Cosmic web filaments */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 150,
          (Math.random() - 0.5) * 150,
          (Math.random() - 0.5) * 150
        ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 20 + Math.random() * 30, 8]} />
          <meshBasicMaterial color={0x4400ff} transparent opacity={0.1} />
        </mesh>
      ))}

      {/* Galaxy clusters */}
      {allGalaxies.map((galaxy, i) => (
        <group key={i} position={galaxy.position as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[galaxy.size, 16, 16]} />
            <meshBasicMaterial color={galaxy.color} transparent opacity={0.4} />
          </mesh>
          {/* Galaxy core glow */}
          <pointLight intensity={0.5} distance={10} color={galaxy.color} />
        </group>
      ))}

      {/* Background universe */}
      <Stars radius={300} depth={100} count={10000} factor={2} saturation={0} fade speed={0.2} />
      
      {/* Cosmic microwave background hint */}
      <mesh>
        <sphereGeometry args={[250, 32, 32]} />
        <meshBasicMaterial color={0x110033} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function SceneContent({ scale }: { scale: CosmicScale }) {
  const { camera } = useThree();
  
  useEffect(() => {
    // Adjust camera based on scale
    switch (scale) {
      case "solar-system":
        camera.position.set(0, 15, 20);
        break;
      case "interstellar":
        camera.position.set(0, 30, 50);
        break;
      case "galaxy":
        camera.position.set(0, 60, 100);
        break;
      case "universe":
        camera.position.set(0, 100, 200);
        break;
    }
  }, [scale, camera]);

  return (
    <>
      <ambientLight intensity={0.1} />
      {scale === "solar-system" && <SolarSystemScene />}
      {scale === "interstellar" && <InterstellarScene />}
      {scale === "galaxy" && <GalaxyScene />}
      {scale === "universe" && <UniverseScene />}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={500}
        autoRotate={scale !== "solar-system"}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function CosmicVisualization({ distance, onClose }: CosmicVisualizationProps) {
  const scale = getScaleFromDistance(distance);
  const [isMinimized, setIsMinimized] = useState(false);

  const scaleInfo = {
    "solar-system": { title: "SOLAR SYSTEM", description: "Local stellar neighborhood", range: "< 100 light-years" },
    "interstellar": { title: "INTERSTELLAR SPACE", description: "Between stars in our galaxy", range: "100 - 10,000 light-years" },
    "galaxy": { title: "MILKY WAY GALAXY", description: "Our home galaxy", range: "10,000 - 100,000 light-years" },
    "universe": { title: "OBSERVABLE UNIVERSE", description: "Cosmic scale structure", range: "> 100,000 light-years" }
  };

  const currentScale = scaleInfo[scale];

  return (
    <div className="fixed inset-0 z-60 bg-black">
      {/* 3D Canvas */}
      <div className={`absolute inset-0 ${isMinimized ? 'opacity-30' : 'opacity-100'} transition-opacity`}>
        <Canvas camera={{ position: [0, 15, 20], fov: 60 }}>
          <SceneContent scale={scale} />
        </Canvas>
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top info bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="crt-panel p-4 pointer-events-auto">
            <h2 className="text-lg font-bold text-cyan-400 neon-text">{currentScale.title}</h2>
            <p className="text-xs text-cyan-400/60 mt-1">{currentScale.description}</p>
            <div className="text-[10px] text-cyan-400/40 mt-2">Distance: {distance.toLocaleString()} light-years</div>
            <div className="text-[10px] text-cyan-400/40">Scale: {currentScale.range}</div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="crt-panel px-4 py-2 text-xs text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            >
              {isMinimized ? "EXPAND" : "MINIMIZE"}
            </button>
            <button
              onClick={onClose}
              className="crt-panel px-4 py-2 text-xs text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            >
              EXIT SIMULATION
            </button>
          </div>
        </div>

        {/* Controls hint */}
        {!isMinimized && (
          <div className="absolute bottom-4 left-4 crt-panel p-3">
            <div className="text-[10px] text-cyan-400/60">
              <div className="font-bold text-cyan-400 mb-1">CONTROLS</div>
              <div>• DRAG to rotate view</div>
              <div>• SCROLL to zoom in/out</div>
              <div>• RIGHT-CLICK DRAG to pan</div>
            </div>
          </div>
        )}

        {/* Scale indicator */}
        <div className="absolute bottom-4 right-4 crt-panel p-3">
          <div className="text-[10px] text-cyan-400/60">
            <div className="font-bold text-cyan-400 mb-1">CURRENT SCALE</div>
            <div className="text-cyan-400">{scale.toUpperCase()}</div>
          </div>
        </div>

        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border border-cyan-400/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400/50 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}