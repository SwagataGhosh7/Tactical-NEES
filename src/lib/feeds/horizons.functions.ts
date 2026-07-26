import { createServerFn } from "@tanstack/react-start";

export interface SpacecraftDto {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  distanceAu: number;
  date: string;
}

const bodies: Record<string, string> = {
  voyager1: "voyager1",
  voyager2: "voyager2",
  parker: "-96",
  jwst: "-170",
  perseverance: "-168",
};

export const getSpacecraftPositions = createServerFn({ method: "GET" }).handler(async () => {
  const now = new Date();
  const start = new Date(now.getTime() - 86400000).toISOString().split("T")[0].replace(/-/g, "-");
  const stop = new Date(now.getTime() + 86400000).toISOString().split("T")[0].replace(/-/g, "-");

  const entries = await Promise.all(
    Object.entries(bodies).map(async ([id, center]) => {
      const url = new URL("https://ssd.jpl.nasa.gov/api/horizons.api");
      url.searchParams.set("format", "json");
      url.searchParams.set("COMMAND", `'${center}'`);
      url.searchParams.set("OBJ_DATA", "NO");
      url.searchParams.set("MAKE_EPHEM", "YES");
      url.searchParams.set("EPHEM_TYPE", "VECTORS");
      url.searchParams.set("CENTER", "@sun");
      url.searchParams.set("START_TIME", start);
      url.searchParams.set("STOP_TIME", stop);
      url.searchParams.set("STEP_SIZE", "1d");
      url.searchParams.set("OUT_UNITS", "AU-D");
      try {
        const res = await fetch(url.toString(), { next: { revalidate: 900 } });
        if (!res.ok) return null;
        const data = await res.json();
        const text = data.result || "";
        const m = text.match(/\$\$SOE[\s\S]*?\$\$EOE/);
        if (!m) return null;
        const lines = m[0].split("\n");
        const line = lines.find((l) => l.includes("X ="));
        if (!line) return null;
        const parts = line.split(/\s+/).filter(Boolean);
        const x = parseFloat(parts[2]);
        const y = parseFloat(parts[3]);
        const z = parseFloat(parts[4]);
        return {
          id,
          name: id.toUpperCase(),
          x,
          y,
          z,
          distanceAu: Math.sqrt(x * x + y * y + z * z),
          date: start,
        } as SpacecraftDto;
      } catch {
        return null;
      }
    })
  );
  return entries.filter(Boolean) as SpacecraftDto[];
});
