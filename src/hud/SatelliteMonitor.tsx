"use client";

import { useState, useEffect } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSatelliteCatalog, type TleDto } from "@/lib/feeds/tle.functions";
import { getIssPosition } from "@/lib/feeds/iss.functions";
import { useTacticalStore } from "@/state/useTacticalStore";

const tleQueryOptions = queryOptions({
  queryKey: ["tles"],
  queryFn: () => getSatelliteCatalog(),
  staleTime: 1000 * 60 * 60,
});

const issQueryOptions = queryOptions({
  queryKey: ["iss"],
  queryFn: () => getIssPosition(),
  staleTime: 5000,
  refetchInterval: 5000,
});

interface SatellitePosition {
  name: string;
  noradId: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  group: string;
}

function calculatePosition(sat: TleDto): SatellitePosition | null {
  try {
    const now = new Date();
    const epochMs = new Date(sat.epoch).getTime();
    const dtDays = (now.getTime() - epochMs) / 86400000;
    const n = sat.meanMotion * 2 * Math.PI;
    const ma = ((sat.meanAnomaly * Math.PI) / 180 + n * dtDays) % (2 * Math.PI);
    const a = Math.pow(8683313.0 / (n * n), 1 / 3);
    const e = Math.min(Math.max(sat.eccentricity, 0), 0.99);
    const E = solveKepler(ma, e);
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    const r = a * (1 - e * Math.cos(E));
    
    // Simplified position calculation
    const i = (sat.inclination * Math.PI) / 180;
    const raan = (sat.raan * Math.PI) / 180;
    const arg = (sat.argOfPerigee * Math.PI) / 180;
    
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);
    
    const cosRaan = Math.cos(raan), sinRaan = Math.sin(raan);
    const cosArg = Math.cos(arg), sinArg = Math.sin(arg);
    const cosI = Math.cos(i), sinI = Math.sin(i);
    
    const x = xOrb * (cosRaan * cosArg - sinRaan * sinArg * cosI) - yOrb * (cosRaan * sinArg + sinRaan * cosArg * cosI);
    const y = xOrb * (sinRaan * cosArg + cosRaan * sinArg * cosI) - yOrb * (sinRaan * sinArg - cosRaan * cosArg * cosI);
    const z = xOrb * sinArg * sinI + yOrb * cosArg * sinI;
    
    // Convert to lat/lon/alt
    const latRad = Math.asin(z / r);
    const lonRad = Math.atan2(y, x);
    const altitude = r - 6371;
    const velocity = Math.sqrt(398600 / r); // Approximate orbital velocity
    
    return {
      name: sat.name,
      noradId: sat.noradId,
      latitude: (latRad * 180) / Math.PI,
      longitude: (lonRad * 180) / Math.PI,
      altitude,
      velocity,
      group: sat.group,
    };
  } catch {
    return null;
  }
}

function solveKepler(M: number, e: number, eps = 1e-7): number {
  let E = M;
  for (let i = 0; i < 30; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < eps) break;
  }
  return E;
}

export function SatelliteMonitor() {
  const layers = useTacticalStore((s) => s.layers);
  const { data: catalog } = useSuspenseQuery(tleQueryOptions);
  const { data: iss } = useSuspenseQuery(issQueryOptions);
  const [selectedSat, setSelectedSat] = useState<SatellitePosition | null>(null);
  const [showImages, setShowImages] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  if (!layers.satelliteMonitor) return null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate live positions for key satellites
  const livePositions = (() => {
    const positions: SatellitePosition[] = [];
    
    // Add ISS if available
    if (iss && iss.latitude && iss.longitude) {
      positions.push({
        name: "ISS (ZARYA)",
        noradId: 25544,
        latitude: iss.latitude,
        longitude: iss.longitude,
        altitude: iss.altitudeKm,
        velocity: 7.66, // Approximate ISS velocity
        group: "stations",
      });
    }
    
    // Add a few key satellites from catalog
    const keySats = catalog.filter(s => 
      s.group === "stations" || 
      s.group === "science" ||
      s.name.includes("HUBBLE") ||
      s.name.includes("SENTINEL")
    ).slice(0, 10);
    
    for (const sat of keySats) {
      const pos = calculatePosition(sat);
      if (pos) positions.push(pos);
    }
    
    return positions;
  })();

  return (
    <aside className="fixed bottom-20 right-4 z-40 w-80 crt-panel p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wider text-cyan-400/90 neon-text">SATELLITE MONITOR</h2>
        <button
          onClick={() => setShowImages(!showImages)}
          className={`text-[10px] px-2 py-1 border ${showImages ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-400 neon-border' : 'border-cyan-500/20 text-cyan-400/60'}`}
        >
          {showImages ? "HIDE IMGS" : "SHOW IMGS"}
        </button>
      </div>
      
      <div className="mb-2 text-[10px] text-cyan-400/70">
        TIME: {currentTime.toLocaleTimeString()} UTC
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto">
        {livePositions.map((sat) => (
          <div
            key={sat.noradId}
            onClick={() => setSelectedSat(sat)}
            className={`cursor-pointer border p-2 text-xs transition-colors ${
              selectedSat?.noradId === sat.noradId
                ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-400 neon-border"
                : "border-cyan-500/20 text-cyan-400/70 hover:border-cyan-400/40"
            }`}
          >
            <div className="flex justify-between">
              <span className="font-bold">{sat.name}</span>
              <span className="text-[10px] text-cyan-400/60">{sat.group.toUpperCase()}</span>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
              <div>
                <span className="text-cyan-400/60">LAT:</span> {sat.latitude.toFixed(2)}°
              </div>
              <div>
                <span className="text-cyan-400/60">LON:</span> {sat.longitude.toFixed(2)}°
              </div>
              <div>
                <span className="text-cyan-400/60">ALT:</span> {sat.altitude.toFixed(0)} km
              </div>
              <div>
                <span className="text-cyan-400/60">VEL:</span> {sat.velocity.toFixed(2)} km/s
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSat && (
        <div className="mt-3 border-t border-cyan-500/20 pt-3">
          <div className="text-[10px] text-cyan-400/60">SELECTED SATELLITE</div>
          <div className="mt-1 text-sm font-bold text-cyan-400 neon-text">{selectedSat.name}</div>
          <div className="mt-2 text-[10px] text-cyan-400/70">
            <div>NORAD ID: {selectedSat.noradId}</div>
            <div>GROUP: {selectedSat.group.toUpperCase()}</div>
          </div>
          
          {showImages && (
            <div className="mt-3">
              <div className="text-[10px] text-cyan-400/60 mb-2">LATEST IMAGERY</div>
              <SatelliteImageFeed satellite={selectedSat} />
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function SatelliteImageFeed({ satellite }: { satellite: SatellitePosition }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Using NASA's Earth imagery API for demonstration
    // In production, you'd use actual satellite imagery APIs
    const lat = satellite.latitude;
    const lon = satellite.longitude;
    
    // NASA's Earth Observatory API (requires API key)
    // Using a placeholder for demo purposes
    const demoImageUrl = `https://earthobservatory.nasa.gov/images/pub/records/${satellite.noradId % 1000}.jpg`;
    
    // Try to load image
    const img = new Image();
    img.onload = () => {
      setImageUrl(demoImageUrl);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = demoImageUrl;
    
    // Fallback to a placeholder if the above fails
    setTimeout(() => {
      if (loading) {
        setError(true);
        setLoading(false);
      }
    }, 3000);
  }, [satellite]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center border border-cyan-500/20 bg-cyan-500/5">
        <div className="text-[10px] text-cyan-400/60">LOADING IMAGERY...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 flex-col items-center justify-center border border-cyan-500/20 bg-cyan-500/5">
        <div className="text-[10px] text-cyan-400/60">NO IMAGERY AVAILABLE</div>
        <div className="mt-1 text-[9px] text-cyan-400/40">Satellite imagery requires API access</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={`Satellite imagery for ${satellite.name}`}
        className="h-32 w-full border border-cyan-500/20 object-cover neon-border"
        onError={() => setError(true)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-[9px] text-cyan-400/80">
        {satellite.name} - VIEW
      </div>
    </div>
  );
}