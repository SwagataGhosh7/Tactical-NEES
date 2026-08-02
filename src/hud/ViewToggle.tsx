"use client";

import { useTacticalStore } from "@/state/useTacticalStore";

export function ViewToggle() {
  const view = useTacticalStore((s) => s.view);
  const setView = useTacticalStore((s) => s.setView);

  return (
    <div className="flex items-center gap-2 rounded border border-cyan-400/30 bg-black/50 px-2 py-1">
      <button
        onClick={() => setView("geocentric")}
        className={`px-2 py-1 text-xs font-bold transition-colors ${
          view === "geocentric" ? "bg-cyan-400 text-black" : "text-cyan-400 hover:bg-cyan-400/10"
        }`}
      >
        EARTH
      </button>
      <button
        onClick={() => setView("heliocentric")}
        className={`px-2 py-1 text-xs font-bold transition-colors ${
          view === "heliocentric" ? "bg-cyan-400 text-black" : "text-cyan-400 hover:bg-cyan-400/10"
        }`}
      >
        SYSTEM
      </button>
    </div>
  );
}
