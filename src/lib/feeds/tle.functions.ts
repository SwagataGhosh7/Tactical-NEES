import { createServerFn } from "@tanstack/react-start";

export interface TleDto {
  noradId: number;
  name: string;
  line1: string;
  line2: string;
  group: string;
}

async function fetchGroup(group: string): Promise<TleDto[]> {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Celestrak ${group} error ${res.status}`);
  const data = await res.json();
  return data.map((s: Record<string, string>) => ({
    noradId: Number(s.NORAD_CAT_ID),
    name: s.OBJECT_NAME,
    line1: s.TLE_LINE1,
    line2: s.TLE_LINE2,
    group,
  }));
}

export const getSatelliteCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const groups = ["starlink", "gps-ops", "active", "weather", "science", "stations"];
  const results = await Promise.all(groups.map(fetchGroup));
  const all = results.flat();
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
