import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { TacticalScene } from "@/scene/Scene";
import { TopBar } from "@/hud/TopBar";
import { LeftRail } from "@/hud/LeftRail";
import { RightReadout } from "@/hud/RightReadout";
import { BottomTicker } from "@/hud/BottomTicker";
import { BootSequence } from "@/hud/BootSequence";
import { SatelliteMonitor } from "@/hud/SatelliteMonitor";
import { CosmicDashboard } from "@/hud/CosmicDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SENTINEL // Earth Space Monitor" },
      { name: "description", content: "Retrofuturist WebGL tracker for asteroids, satellites, spacecraft and solar weather." },
      { property: "og:title", content: "SENTINEL // Earth Space Monitor" },
      { property: "og:description", content: "Retrofuturist WebGL tracker for asteroids, satellites, spacecraft and solar weather." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-cyan-400">
      <BootSequence />
      <TopBar />
      <LeftRail />
      <RightReadout />
      <BottomTicker />
      <SatelliteMonitor />
      <CosmicDashboard />
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center text-cyan-400">
            <div className="crt-glow text-sm">INITIALIZING SENSORS...</div>
          </div>
        }
      >
        <TacticalScene />
      </Suspense>
    </div>
  );
}
