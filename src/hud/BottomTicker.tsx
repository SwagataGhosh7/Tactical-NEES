"use client";

import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getNeoFeed, type NeoDto } from "@/lib/feeds/neo.functions";
import { getDonkiAlerts, type DonkiAlertDto } from "@/lib/feeds/spaceweather.functions";

const neoQueryOptions = queryOptions({
  queryKey: ["neos"],
  queryFn: () => getNeoFeed(),
  staleTime: 1000 * 60 * 60,
});

const donkiQueryOptions = queryOptions({
  queryKey: ["donki"],
  queryFn: () => getDonkiAlerts(),
  staleTime: 1000 * 60 * 5,
});

export function BottomTicker() {
  const { data: neos } = useSuspenseQuery(neoQueryOptions);
  const { data: alerts } = useSuspenseQuery(donkiQueryOptions);

  const threats = (neos || [])
    .filter((n) => n.approachBody === "Earth")
    .slice(0, 10)
    .map((n) => `${n.name} • miss ${n.missDistanceAu.toFixed(4)} AU • ${n.relativeVelocityKph.toFixed(0)} kph ${n.hazardous ? "⚠ HAZARDOUS" : ""}`);

  const weather = (alerts || []).map((a: DonkiAlertDto) => `${a.messageType} @ ${a.startTime.slice(0, 16)}`);

  const items = [...threats, ...weather];
  if (items.length === 0) items.push("NO ACTIVE THREAT DATA");

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 crt-panel">
      <div className="flex h-10 items-center overflow-hidden">
        <div className="flex h-full items-center bg-alert-red/20 px-3 text-xs font-bold text-alert-red crt-glow-red">
          THREAT BOARD
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-xs text-cyan-400/90">
            {items.map((item, i) => (
              <span key={i} className="mx-8 inline-block">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
