import { createServerFn } from "@tanstack/react-start";

export interface NeoDto {
  id: string;
  name: string;
  diameterMinM: number;
  diameterMaxM: number;
  hazardous: boolean;
  closeApproachDate: string;
  missDistanceAu: number;
  relativeVelocityKph: number;
  approachBody: string;
}

export const getNeoFeed = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const start = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${endDate}&api_key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`NeoWs feed error ${res.status}`);
  const data = await res.json();
  const out: NeoDto[] = [];
  for (const day of Object.keys(data.near_earth_objects)) {
    for (const neo of data.near_earth_objects[day]) {
      const ca = neo.close_approach_data?.[0];
      if (!ca) continue;
      out.push({
        id: neo.neo_reference_id,
        name: neo.name,
        diameterMinM: neo.estimated_diameter.meters.estimated_diameter_min,
        diameterMaxM: neo.estimated_diameter.meters.estimated_diameter_max,
        hazardous: neo.is_potentially_hazardous_asteroid,
        closeApproachDate: ca.close_approach_date_full,
        missDistanceAu: parseFloat(ca.miss_distance.astronomical),
        relativeVelocityKph: parseFloat(ca.relative_velocity.kilometers_per_hour),
        approachBody: ca.orbiting_body,
      });
    }
  }
  return out.sort((a, b) => a.missDistanceAu - b.missDistanceAu);
});
