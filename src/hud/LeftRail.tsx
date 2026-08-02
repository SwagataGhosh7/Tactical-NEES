"use client";

import { useTacticalStore } from "@/state/useTacticalStore";
import { type LayerState } from "@/state/useTacticalStore";

const layerMeta: { key: keyof LayerState; label: string }[] = [
  { key: "iss", label: "ISS" },
  { key: "starlink", label: "STARLINK" },
  { key: "gps", label: "GPS" },
  { key: "otherSats", label: "OTHER SATS" },
  { key: "neos", label: "NEOs" },
  { key: "spacecraft", label: "SPACECRAFT" },
  { key: "solarWind", label: "SOLAR WIND" },
  { key: "satelliteMonitor", label: "SAT MONITOR" },
  { key: "cosmicDashboard", label: "COSMIC DASH" },
];

export function LeftRail() {
  const layers = useTacticalStore((s) => s.layers);
  const toggle = useTacticalStore((s) => s.toggleLayer);
  const maxMiss = useTacticalStore((s) => s.maxMissDistanceAu);
  const setMaxMiss = useTacticalStore((s) => s.setMaxMissDistanceAu);
  const minDia = useTacticalStore((s) => s.minDiameterM);
  const setMinDia = useTacticalStore((s) => s.setMinDiameterM);

  return (
    <aside className="fixed top-16 left-4 z-40 w-52 crt-panel p-3">
      <h2 className="mb-3 text-xs font-bold tracking-wider text-cyan-400/90 neon-text">LAYER CONTROL</h2>
      <div className="space-y-2">
        {layerMeta.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex w-full items-center justify-between border px-2 py-1 text-xs font-bold transition-colors ${
              layers[key]
                ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-400 neon-border"
                : "border-cyan-500/20 text-cyan-400/40 hover:text-cyan-400/70"
            }`}
          >
            <span>{label}</span>
            <span className={`h-2 w-2 rounded-full ${layers[key] ? "bg-cyan-400 shadow-[0_0_6px_#00ffff]" : "bg-cyan-400/20"}`} />
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-cyan-400/70">
            <span>MAX MISS DIST</span>
            <span>{maxMiss.toFixed(3)} AU</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={0.5}
            step={0.001}
            value={maxMiss}
            onChange={(e) => setMaxMiss(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-cyan-400/70">
            <span>MIN DIAMETER</span>
            <span>{minDia.toFixed(0)} m</span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={minDia}
            onChange={(e) => setMinDia(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>
    </aside>
  );
}
