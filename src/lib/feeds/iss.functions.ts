import { createServerFn } from "@tanstack/react-start";

export interface IssDto {
  name: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKph: number;
  timestamp: number;
}

export const getIssPosition = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      altitudeKm: data.altitude,
      velocityKph: data.velocity,
      timestamp: data.timestamp * 1000,
    } as IssDto;
  } catch {
    return null;
  }
});
