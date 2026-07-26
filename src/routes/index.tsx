import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { TacticalScene } from "@/scene/Scene";
import { TopBar } from "@/hud/TopBar";
import { LeftRail } from "@/hud/LeftRail";
import { RightReadout } from "@/hud/RightReadout";
import { BottomTicker } from "@/hud/BottomTicker";
import { BootSequence } from "@/hud/BootSequence";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TACTICAL // Near-Earth Encounter System" },
      { name: "description", content: "Retrofuturist WebGL tracker for asteroids, satellites, spacecraft and solar weather." },
      { property: "og:title", content: "TACTICAL // Near-Earth Encounter System" },
      { property: "og:description", content: "Retrofuturist WebGL tracker for asteroids, satellites, spacecraft and solar weather." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-amber">
      <BootSequence />
      <TopBar />
      <LeftRail />
      <RightReadout />
      <BottomTicker />
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center text-amber">
            <div className="crt-glow text-sm">INITIALIZING SENSORS...</div>
          </div>
        }
      >
        <TacticalScene />
      </Suspense>
    </div>
  );
}
