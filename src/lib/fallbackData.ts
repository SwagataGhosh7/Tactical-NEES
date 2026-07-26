import type { TleDto } from "./feeds/tle.functions";
import type { NeoDto } from "./feeds/neo.functions";

export function fallbackSatellites(): TleDto[] {
  const sats: TleDto[] = [];

  // ISS-like low earth orbit
  sats.push({
    noradId: 25544,
    name: "ISS (ZARYA)",
    group: "stations",
    meanMotion: 15.5,
    inclination: 51.64,
    raan: 120,
    eccentricity: 0.0007,
    argOfPerigee: 220,
    meanAnomaly: 0,
    epoch: new Date().toISOString(),
  });

  // Starlink shells
  const starlinkInclinations = [53, 53.2, 70, 97.6];
  const starlinkPlanes = [6, 6, 4, 4];
  let id = 40000;
  for (let shell = 0; shell < starlinkInclinations.length; shell++) {
    const inc = starlinkInclinations[shell];
    const planes = starlinkPlanes[shell];
    const satsPerPlane = shell === 3 ? 30 : 22;
    const altKm = shell === 0 ? 550 : shell === 1 ? 540 : shell === 2 ? 570 : 560;
    const a = 6371 + altKm;
    const n = 86400 / (2 * Math.PI * Math.sqrt((a * a * a) / 398600.4)); // rad/day -> rev/day
    for (let p = 0; p < planes; p++) {
      for (let s = 0; s < satsPerPlane; s++) {
        sats.push({
          noradId: id++,
          name: `STARLINK-${id}`,
          group: "starlink",
          meanMotion: n,
          inclination: inc + (Math.random() - 0.5) * 0.2,
          raan: (p * 360) / planes + (Math.random() - 0.5) * 5,
          eccentricity: 0.0001,
          argOfPerigee: Math.random() * 360,
          meanAnomaly: (s * 360) / satsPerPlane + Math.random() * 5,
          epoch: new Date().toISOString(),
        });
      }
    }
  }

  // GPS constellation
  const gpsIdStart = 32000;
  for (let p = 0; p < 6; p++) {
    for (let s = 0; s < 4; s++) {
      const a = 26560;
      const n = 86400 / (2 * Math.PI * Math.sqrt((a * a * a) / 398600.4));
      sats.push({
        noradId: gpsIdStart + p * 4 + s,
        name: `GPS-${p * 4 + s + 1}`,
        group: "gps-ops",
        meanMotion: n,
        inclination: 55 + (Math.random() - 0.5) * 0.2,
        raan: p * 60 + (Math.random() - 0.5) * 3,
        eccentricity: 0.001,
        argOfPerigee: Math.random() * 360,
        meanAnomaly: s * 90 + Math.random() * 5,
        epoch: new Date().toISOString(),
      });
    }
  }

  // Some generic active LEO sats
  for (let i = 0; i < 200; i++) {
    const a = 6371 + 600 + Math.random() * 800;
    const n = 86400 / (2 * Math.PI * Math.sqrt((a * a * a) / 398600.4));
    sats.push({
      noradId: 50000 + i,
      name: `ACTIVE-${i}`,
      group: "active",
      meanMotion: n,
      inclination: Math.random() * 98,
      raan: Math.random() * 360,
      eccentricity: 0.001,
      argOfPerigee: Math.random() * 360,
      meanAnomaly: Math.random() * 360,
      epoch: new Date().toISOString(),
    });
  }

  return sats;
}

export function fallbackNeos(): NeoDto[] {
  return [
    { id: "1", name: "(2024 AA)", diameterMinM: 20, diameterMaxM: 45, hazardous: false, closeApproachDate: "2026-07-26", missDistanceAu: 0.02, relativeVelocityKph: 35000, approachBody: "Earth" },
    { id: "2", name: "(2024 AB)", diameterMinM: 80, diameterMaxM: 160, hazardous: true, closeApproachDate: "2026-07-27", missDistanceAu: 0.04, relativeVelocityKph: 42000, approachBody: "Earth" },
    { id: "3", name: "(2024 AC)", diameterMinM: 10, diameterMaxM: 25, hazardous: false, closeApproachDate: "2026-07-28", missDistanceAu: 0.08, relativeVelocityKph: 28000, approachBody: "Earth" },
    { id: "4", name: "(2024 AD)", diameterMinM: 150, diameterMaxM: 300, hazardous: true, closeApproachDate: "2026-07-29", missDistanceAu: 0.12, relativeVelocityKph: 55000, approachBody: "Earth" },
    { id: "5", name: "(2024 AE)", diameterMinM: 5, diameterMaxM: 15, hazardous: false, closeApproachDate: "2026-07-30", missDistanceAu: 0.15, relativeVelocityKph: 32000, approachBody: "Earth" },
  ];
}
