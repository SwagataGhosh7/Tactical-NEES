"use client";

import { useEffect, useState } from "react";
import { useTacticalStore } from "@/state/useTacticalStore";
import { ViewToggle } from "./ViewToggle";

export function TopBar() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const view = useTacticalStore((s) => s.view);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const met = Math.floor(now.getTime() / 1000) % 100000;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 crt-panel">
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold tracking-widest text-amber crt-glow">TACTICAL</div>
        <div className="hidden h-4 w-px bg-amber/30 md:block" />
        <div className="text-xs text-amber/80">
          VIEW: <span className="font-bold uppercase text-amber">{view}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-xs text-amber/60">UTC</div>
          <div className="text-sm font-bold text-amber">
            {mounted ? now.toISOString().replace("T", " ").slice(0, 19) : "----/--/-- --:--:--"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-amber/60">MET</div>
          <div className="text-sm font-bold text-amber">T+{mounted ? met.toString().padStart(6, "0") : "------"}s</div>
        </div>
        <div className="flex items-center gap-2">
          <FeedLed label="NASA" active />
          <FeedLed label="JPL" active />
          <FeedLed label="CELESTRAK" active />
        </div>
        <ViewToggle />
      </div>
    </header>
  );
}

function FeedLed({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${active ? "bg-amber shadow-[0_0_6px_#ffb000]" : "bg-amber/20"}`} />
      <span className="text-[9px] text-amber/60">{label}</span>
    </div>
  );
}
