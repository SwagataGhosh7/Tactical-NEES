import { createServerFn } from "@tanstack/react-start";

export interface TleDto {
  noradId: number;
  name: string;
  group: string;
  meanMotion: number; // revs/day
  inclination: number; // deg
  raan: number; // deg
  eccentricity: number;
  argOfPerigee: number; // deg
  meanAnomaly: number; // deg
  epoch: string;
}

async function fetchGroup(group: string): Promise<TleDto[]> {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((s: Record<string, string | number>) => ({
      noradId: Number(s.NORAD_CAT_ID),
      name: String(s.OBJECT_NAME),
      group,
      meanMotion: Number(s.MEAN_MOTION),
      inclination: Number(s.INCLINATION),
      raan: Number(s.RA_OF_ASC_NODE),
      eccentricity: Number(s.ECCENTRICITY),
      argOfPerigee: Number(s.ARG_OF_PERICENTER),
      meanAnomaly: Number(s.MEAN_ANOMALY),
      epoch: String(s.EPOCH),
    }));
  } catch {
    return [];
  }
}

export const getSatelliteCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const groups = ["starlink", "gps-ops", "active", "weather", "science", "stations"];
  const results = await Promise.all(groups.map(fetchGroup));
  const all = results.flat();
  if (all.length === 0) {
    const { fallbackSatellites } = await import("@/lib/fallbackData");
    return fallbackSatellites();
  }
  const seen = new Set<number>();
  const deduped: TleDto[] = [];
  for (const s of all) {
    if (!seen.has(s.noradId)) {
      seen.add(s.noradId);
      deduped.push(s);
    }
  }
  return deduped;
});
