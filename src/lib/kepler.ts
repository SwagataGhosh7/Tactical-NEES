import * as THREE from "three";

export interface OrbitalElements {
  a: number; // semi-major axis (au)
  e: number; // eccentricity
  i: number; // inclination (deg)
  om: number; // longitude of ascending node (deg)
  w: number; // argument of perihelion (deg)
  ma: number; // mean anomaly at epoch (deg)
  epoch: number; // Julian date
}

const DEG = Math.PI / 180;
const MU_SUN = 2.9591220828559115e-4; // au^3 / day^2 (GM Sun)

export function solveKepler(M: number, e: number, eps = 1e-8): number {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < eps) break;
  }
  return E;
}

export function propagateKepler(elements: OrbitalElements, jd: number): THREE.Vector3 {
  const { a, e, i, om, w, ma, epoch } = elements;
  const n = Math.sqrt(MU_SUN / (a * a * a)); // mean motion rad/day
  const dt = jd - epoch;
  const M = (ma * DEG + n * dt) % (2 * Math.PI);
  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  const r = a * (1 - e * Math.cos(E));
  const x = r * Math.cos(nu);
  const y = r * Math.sin(nu);
  const z = 0;

  const I = i * DEG;
  const Om = om * DEG;
  const W = w * DEG;

  const cosOm = Math.cos(Om), sinOm = Math.sin(Om);
  const cosW = Math.cos(W), sinW = Math.sin(W);
  const cosI = Math.cos(I), sinI = Math.sin(I);

  const X = x * (cosOm * cosW - sinOm * sinW * cosI) - y * (cosOm * sinW + sinOm * cosW * cosI);
  const Y = x * (sinOm * cosW + cosOm * sinW * cosI) - y * (sinOm * sinW - cosOm * cosW * cosI);
  const Z = x * sinW * sinI + y * cosW * sinI;

  return new THREE.Vector3(X, Z, -Y);
}

export function sampleKeplerOrbit(elements: OrbitalElements, steps = 128): THREE.Vector3[] {
  const period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a, 3) / MU_SUN);
  const points: THREE.Vector3[] = [];
  for (let k = 0; k <= steps; k++) {
    const jd = elements.epoch + (k / steps) * period;
    points.push(propagateKepler(elements, jd));
  }
  return points;
}

export function getJulianDate(date = new Date()): number {
  return 2440587.5 + date.getTime() / 86400000;
}
