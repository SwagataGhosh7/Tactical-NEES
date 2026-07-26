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
      <h2 className="mb-3 text-xs font-bold tracking-wider text-amber/70">LAYER CONTROL</h2>
      <div className="space-y-2">
        {layerMeta.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex w-full items-center justify-between border px-2 py-1 text-xs font-bold transition-colors ${
              layers[key]
                ? "border-amber/60 bg-amber/10 text-amber"
                : "border-amber/20 text-amber/40 hover:text-amber/70"
            }`}
          >
            <span>{label}</span>
            <span className={`h-2 w-2 rounded-full ${layers[key] ? "bg-amber shadow-[0_0_6px_#ffb000]" : "bg-amber/20"}`} />
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-amber/70">
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
            className="w-full accent-amber"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-amber/70">
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
            className="w-full accent-amber"
          />
        </div>
      </div>
    </aside>
  );
}
