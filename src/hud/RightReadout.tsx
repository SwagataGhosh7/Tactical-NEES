"use client";

import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSolarWind, type SolarWindDto } from "@/lib/feeds/spaceweather.functions";

const swQueryOptions = queryOptions({
  queryKey: ["solarwind"],
  queryFn: () => getSolarWind(),
  staleTime: 1000 * 60 * 5,
  refetchInterval: 1000 * 60 * 5,
});

export function RightReadout() {
  const { data: sw } = useSuspenseQuery(swQueryOptions);

  return (
    <aside className="fixed top-16 right-4 z-40 w-56 crt-panel p-3">
      <h2 className="mb-3 text-xs font-bold tracking-wider text-amber/70">TELEMETRY</h2>
      <div className="space-y-3 text-xs">
        <ReadoutRow label="SOLAR WIND" value={sw?.speed ? `${Math.round(sw.speed)} km/s` : "NO SIGNAL"} alert={!sw?.speed} />
        <ReadoutRow label="DENSITY" value={sw?.density ? `${sw.density.toFixed(1)} p/cm³` : "--"} />
        <ReadoutRow label="TEMP" value={sw?.temperature ? `${(sw.temperature / 1000).toFixed(1)}e3 K` : "--"} />
        <ReadoutRow label="MAG FIELD" value="--" />
        <ReadoutRow label="KP INDEX" value="--" />
      </div>
      <div className="mt-4 border-t border-amber/20 pt-3">
        <div className="text-[10px] text-amber/60">SELECTED OBJECT</div>
        <div className="mt-1 text-sm font-bold text-amber">NONE</div>
      </div>
    </aside>
  );
}

function ReadoutRow({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex justify-between border-b border-amber/10 pb-1">
      <span className="text-amber/60">{label}</span>
      <span className={`font-bold ${alert ? "text-alert-red crt-glow-red" : "text-amber"}`}>{value}</span>
    </div>
  );
}
