"use client";

import { Canvas } from "@react-three/fiber";
import { XR, VRButton, ARButton } from "@react-three/xr";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls, Stars, Sparkles, Float } from "@react-three/drei";

interface VRXRCosmicExperienceProps {
  distance: number;
  onClose: () => void;
  mode: "VR" | "AR";
  onSwitchTo3D?: () => void;
}

type CosmicScale = "solar-system" | "interstellar" | "galaxy" | "universe";

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

  return (
    <group ref={planetsRef}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={0xffdd00} />
        <pointLight intensity={2} distance={20} />
      </mesh>

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
  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#ff00ff" />
      <Sparkles count={150} scale={15} size={3} speed={0.3} opacity={0.3} color="#00ffff" />
      
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
  const armCount = 4;

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
    <group>
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={0xffdd88} transparent opacity={0.3} />
      </mesh>
      <pointLight intensity={3} distance={50} color={0xffdd88} />

      {allStars.map((star, i) => (
        <mesh key={i} position={star.position as [number, number, number]}>
          <sphereGeometry args={[star.size, 4, 4]} />
          <meshBasicMaterial color={star.color} />
        </mesh>
      ))}

      <Stars radius={150} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
      
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
    <group>
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

      {allGalaxies.map((galaxy, i) => (
        <group key={i} position={galaxy.position as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[galaxy.size, 16, 16]} />
            <meshBasicMaterial color={galaxy.color} transparent opacity={0.4} />
          </mesh>
          <pointLight intensity={0.5} distance={10} color={galaxy.color} />
        </group>
      ))}

      <Stars radius={300} depth={100} count={10000} factor={2} saturation={0} fade speed={0.2} />
      
      <mesh>
        <sphereGeometry args={[250, 32, 32]} />
        <meshBasicMaterial color={0x110033} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function XRCosmicScene({ distance }: { distance: number }) {
  const scale = getScaleFromDistance(distance);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {scale === "solar-system" && <SolarSystemScene />}
      {scale === "interstellar" && <InterstellarScene />}
      {scale === "galaxy" && <GalaxyScene />}
      {scale === "universe" && <UniverseScene />}
    </>
  );
}

export function VRXRCosmicExperience({ distance, onClose, mode, onSwitchTo3D }: VRXRCosmicExperienceProps) {
  const scale = getScaleFromDistance(distance);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check WebXR support
    const checkXRSupport = async () => {
      try {
        if ('xr' in navigator) {
          const isVRSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
          const isARSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
          
          if (mode === 'VR' && !isVRSupported) {
            setError('VR not supported in this browser. Try using a VR headset with a compatible browser like Chrome or Edge.');
            setXrSupported(false);
          } else if (mode === 'AR' && !isARSupported) {
            setError('AR not supported in this browser. Try using a mobile device with WebAR support like Chrome on Android.');
            setXrSupported(false);
          } else {
            setXrSupported(true);
          }
        } else {
          setError('WebXR is not supported in this browser. Please use a modern browser with WebXR support.');
          setXrSupported(false);
        }
      } catch (err) {
        console.error('WebXR check failed:', err);
        setError('Failed to check WebXR support. Falling back to 3D simulation.');
        setXrSupported(false);
      }
    };

    checkXRSupport();
  }, [mode]);

  const scaleInfo = {
    "solar-system": { title: "SOLAR SYSTEM", description: "Local stellar neighborhood" },
    "interstellar": { title: "INTERSTELLAR SPACE", description: "Between stars in our galaxy" },
    "galaxy": { title: "MILKY WAY GALAXY", description: "Our home galaxy" },
    "universe": { title: "OBSERVABLE UNIVERSE", description: "Cosmic scale structure" }
  };

  const currentScale = scaleInfo[scale];

  // Show error state
  if (error || xrSupported === false) {
    return (
      <div className="fixed inset-0 z-70 bg-black flex items-center justify-center p-4">
        <div className="crt-panel p-6 max-w-md text-center">
          <h2 className="text-lg font-bold text-cyan-400 neon-text mb-4">XR NOT AVAILABLE</h2>
          <p className="text-sm text-cyan-400/60 mb-6">{error || 'XR mode is not available on this device.'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors text-xs"
            >
              BACK TO DASHBOARD
            </button>
            <button
              onClick={() => {
                // Switch to regular 3D mode
                onClose();
                if (onSwitchTo3D) {
                  onSwitchTo3D();
                }
              }}
              className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/30 transition-colors text-xs"
            >
              USE 3D MODE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (xrSupported === null) {
    return (
      <div className="fixed inset-0 z-70 bg-black flex items-center justify-center">
        <div className="text-cyan-400/60 text-sm">Checking XR support...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-70 bg-black">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={onClose}
          className="crt-panel px-4 py-2 text-xs text-cyan-400 hover:bg-cyan-400/10 transition-colors"
        >
          EXIT XR
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 crt-panel p-3">
        <div className="text-sm font-bold text-cyan-400 neon-text">{currentScale.title}</div>
        <div className="text-xs text-cyan-400/60 mt-1">{currentScale.description}</div>
        <div className="text-[10px] text-cyan-400/40 mt-2">Distance: {distance.toLocaleString()} light-years</div>
        <div className="text-[10px] text-cyan-400/40 mt-1">Mode: {mode.toUpperCase()}</div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 crt-panel p-3">
        <div className="text-[10px] text-cyan-400/60">
          <div className="font-bold text-cyan-400 mb-1">XR CONTROLS</div>
          <div>• TRIGGER to select</div>
          <div>• GRIP to grab</div>
          <div>• THUMBSTICK to move</div>
          <div>• MENU to reset view</div>
        </div>
      </div>

      <Canvas>
        <XR>
          <Suspense fallback={null}>
            <XRCosmicScene distance={distance} />
          </Suspense>
        </XR>
      </Canvas>

      {mode === "VR" ? (
        <VRButton className="fixed bottom-4 right-4 z-10" />
      ) : (
        <ARButton className="fixed bottom-4 right-4 z-10" />
      )}
    </div>
  );
}