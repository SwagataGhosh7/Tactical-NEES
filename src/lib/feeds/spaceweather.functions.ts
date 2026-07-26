import { createServerFn } from "@tanstack/react-start";

export interface SolarWindDto {
  time: string;
  speed: number | null;
  density: number | null;
  temperature: number | null;
}

export interface DonkiAlertDto {
  messageType: string;
  startTime: string;
  link: string;
}

export const getSolarWind = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch("https://services.swpc.noaa.gov/products/summary/ace-swepam/summary.json", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Solar wind error ${res.status}`);
    const data = await res.json();
    return {
      time: data["TimeStamp"] || new Date().toISOString(),
      speed: data["Speed"] ? Number(data["Speed"]) : null,
      density: data["Density"] ? Number(data["Density"]) : null,
      temperature: data["Temperature"] ? Number(data["Temperature"]) : null,
    } as SolarWindDto;
  } catch {
    return { time: new Date().toISOString(), speed: null, density: null, temperature: null } as SolarWindDto;
  }
});

export const getDonkiAlerts = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const end = new Date().toISOString().split("T")[0];
  const url = `https://api.nasa.gov/DONKI/notifications?startDate=${start}&endDate=${end}&type=all&api_key=${key}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [] as DonkiAlertDto[];
    const data = await res.json();
    return (Array.isArray(data) ? data : [])
      .slice(0, 20)
      .map((a: Record<string, string>) => ({
        messageType: a.messageType || "SPACE_WEATHER",
        startTime: a.messageIssueTime || a.startTime || new Date().toISOString(),
        link: a.messageURL || "#",
      })) as DonkiAlertDto[];
  } catch {
    return [] as DonkiAlertDto[];
  }
});
