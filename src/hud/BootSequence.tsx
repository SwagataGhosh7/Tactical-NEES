"use client";

import { useEffect, useState } from "react";
import { useTacticalStore } from "@/state/useTacticalStore";

const lines = [
  "BOOT SEQUENCE INITIATED...",
  "LOADING ORBITAL MECHANICS MODULE...",
  "HANDSHAKE NASA NEO/Ws ........ OK",
  "HANDSHAKE JPL HORIZONS ........ OK",
  "HANDSHAKE CELESTRAK TLE ....... OK",
  "HANDSHAKE NOAA SWPC ........... OK",
  "CALIBRATING PHOSPHOR DISPLAY.... OK",
  "TACTICAL SYSTEM ONLINE",
];

export function BootSequence() {
  const booted = useTacticalStore((s) => s.booted);
  const setBooted = useTacticalStore((s) => s.setBooted);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (booted) return;
    const id = setInterval(() => {
      setIndex((i) => {
        if (i >= lines.length - 1) {
          clearInterval(id);
          setTimeout(() => setBooted(true), 600);
          return i;
        }
        return i + 1;
      });
    }, 280);
    return () => clearInterval(id);
  }, [booted, setBooted]);

  if (booted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="w-full max-w-2xl p-8 font-mono text-amber">
        <div className="mb-4 text-2xl font-bold tracking-widest crt-glow">TACTICAL // N.E.E.S.</div>
        <div className="space-y-1 text-sm">
          {lines.slice(0, index + 1).map((line, i) => (
            <div key={i} className={line.includes("ONLINE") ? "crt-glow font-bold" : ""}>
              {line}
            </div>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-amber" />
        </div>
      </div>
    </div>
  );
}
