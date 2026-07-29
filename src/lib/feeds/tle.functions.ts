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

function parseTleLines(
  name: string,
  line1: string,
  line2: string,
  group: string,
  date: string
): TleDto {
  // Line 2 standard TLE format columns:
  // Col 3-7: Catalog Number
  // Col 9-16: Inclination
  // Col 18-25: RAAN
  // Col 27-33: Eccentricity (assumed decimal point)
  // Col 35-42: Argument of Perigee
  // Col 44-51: Mean Anomaly
  // Col 53-63: Mean Motion
  const noradId = Number(line2.substring(2, 7).trim());
  const inclination = Number(line2.substring(8, 16).trim());
  const raan = Number(line2.substring(17, 25).trim());
  const eccentricity = Number("0." + line2.substring(26, 33).trim());
  const argOfPerigee = Number(line2.substring(34, 42).trim());
  const meanAnomaly = Number(line2.substring(43, 51).trim());
  const meanMotion = Number(line2.substring(52, 63).trim());

  return {
    noradId,
    name,
    group,
    meanMotion,
    inclination,
    raan,
    eccentricity,
    argOfPerigee,
    meanAnomaly,
    epoch: date,
  };
}

async function fetchGroupFromFallback(group: string): Promise<TleDto[]> {
  let searchQuery = "";
  switch (group) {
    case "starlink":
      searchQuery = "STARLINK";
      break;
    case "gps-ops":
      searchQuery = "GPS";
      break;
    case "stations":
      searchQuery = "ISS";
      break;
    case "weather":
      searchQuery = "NOAA";
      break;
    case "science":
      searchQuery = "SENTINEL";
      break;
    case "active":
      searchQuery = "ONEWEB";
      break;
    default:
      return [];
  }

  const url = `https://tle.ivanstanojevic.me/api/tle/?search=${searchQuery}&page-size=100`;
  try {
    console.log(`[TLE Fallback] Fetching alternate TLE data for group: ${group} from: ${url}`);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      console.warn(`[TLE Fallback] Alternative API returned status: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.member)) {
      console.warn(`[TLE Fallback] Invalid structure returned from alternative API for group: ${group}`);
      return [];
    }

    const parsed: TleDto[] = [];
    for (const item of data.member) {
      if (!item.name || !item.line1 || !item.line2) continue;
      try {
        const sat = parseTleLines(
          item.name,
          item.line1,
          item.line2,
          group,
          item.date || new Date().toISOString()
        );
        parsed.push(sat);
      } catch (err) {
        console.error(`[TLE Fallback] Error parsing TLE lines for ${item.name}:`, err);
      }
    }
    console.log(`[TLE Fallback] Successfully parsed ${parsed.length} satellites for group: ${group}`);
    return parsed;
  } catch (err) {
    console.error(`[TLE Fallback] Fetch failed for group ${group}:`, err);
    return [];
  }
}

async function fetchGroup(group: string): Promise<TleDto[]> {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      console.warn(`[Celestrak] Fetch group ${group} returned status ${res.status}, falling back to alternative TLE API.`);
      return fetchGroupFromFallback(group);
    }
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
  } catch (err) {
    console.warn(`[Celestrak] Fetch group ${group} threw error, falling back to alternative TLE API:`, err);
    return fetchGroupFromFallback(group);
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
