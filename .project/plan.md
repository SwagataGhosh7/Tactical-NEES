
# SENTINEL: Earth Space Monitor

A single-page WebGL app with two toggleable views (Earth tactical / Heliocentric solar system) styled as a Star Wars-era amber phosphor CRT tactical console, streaming live data from NASA + JPL + Celestrak.

## Views

**1. GEOCENTRIC — Earth Tactical View** (default)
- 3D Earth (rotating, wireframe + subtle texture) at center on a starfield.
- Orbiting layers you can toggle:
  - ISS (live position, ground track)
  - Starlink swarm (~6k)
  - GPS constellation (~30)
  - Other active sats grouped by category (weather, science, comms) up to ~15k total
- Incoming NEO vectors: arrows drawn from approach direction toward Earth, sized by diameter, color-coded by miss distance.
- HUD overlays: local sidereal time, sunlight terminator, threat board of next 10 close approaches.

**2. HELIOCENTRIC — Solar System View**
- Sun-centered, planets to scale (log distance), Earth highlighted.
- Live spacecraft positions (Voyager 1/2, Parker Solar Probe, JWST, Perseverance, etc.) via JPL Horizons.
- Asteroid orbit ribbons for NEOs currently in the 7-day window (SBDB elements → propagated with Keplerian solver).
- Solar wind gauge (speed/density) as animated radial pulse from Sun.

Top-right toggle switches between views with a CRT wipe transition.

## Retro-futurist aesthetic

- Palette: deep black `#000`, amber `#ffb000`, hot orange `#ff7a00`, red alerts `#ff2a2a`, dim cyan accents.
- Type: monospace (JetBrains Mono / VT323 for callouts).
- Effects: scanlines, subtle CRT curvature vignette, phosphor glow bloom, chromatic aberration on hover, occasional "signal lost" flicker, boot-up sequence on first load.
- HUD frames with corner brackets, hazard stripes, targeting reticles, tick-mark rings, callout labels with leader lines.

## Panels around the viewport

- **TOP BAR**: mission clock (UTC + MET), data feed status LEDs (NASA / JPL / Celestrak), view toggle.
- **LEFT**: layer toggles (ISS / Starlink / GPS / Other Sats / NEOs / Spacecraft / Solar Wind), filter sliders (max miss distance, min diameter).
- **RIGHT**: selected-object readout — designation, orbit params, velocity, distance, next close approach, source link.
- **BOTTOM**: scrolling threat ticker of upcoming NEO close approaches + DONKI space-weather alerts.

## Data sources

| Feed | Endpoint | Refresh |
|---|---|---|
| NEO 7-day feed | `api.nasa.gov/neo/rest/v1/feed` | hourly |
| NEO/asteroid orbit elements | `ssd-api.jpl.nasa.gov/sbdb.api` | on-select |
| Close approach data | `ssd-api.jpl.nasa.gov/cad.api` | hourly |
| Spacecraft ephemerides | `ssd.jpl.nasa.gov/api/horizons.api` | 15 min |
| Space weather / solar wind | `api.nasa.gov/DONKI/*` + NOAA SWPC ACE/DSCOVR JSON | 5 min |
| ISS live position | `api.wheretheiss.at/v1/satellites/25544` | 5 s |
| Satellite catalog (TLEs) | `celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json` + starlink / gps-ops groups | 6 h |

TLEs propagated client-side with `satellite.js` (SGP4). Only nearest ~2k sats fully rendered as instanced meshes; rest as GPU points to hold 60fps at 15k.

## Technical section

**Stack**
- TanStack Start (existing template), React 19, Tailwind v4.
- three.js + `@react-three/fiber` + `drei` for WebGL. Postprocessing (`postprocessing` pkg) for bloom / scanlines / chromatic aberration / vignette.
- `satellite.js` for SGP4 propagation.
- Custom Keplerian propagator for NEO orbits.
- Zustand for view/layer state; TanStack Query for feed caching.

**Server boundary**
- All third-party fetches proxied through `createServerFn` handlers in `src/lib/feeds/*.functions.ts` to hide `NASA_API_KEY`, add caching headers, and normalize payloads to compact DTOs.
- Cloud enablement + `add_secret` for `NASA_API_KEY` (user obtains from api.nasa.gov, free). Celestrak / JPL / NOAA / wheretheiss are keyless.
- Server functions return trimmed DTOs (id, name, epoch, elements/state vector, diameter, miss distance…) — never raw upstream JSON.

**Performance**
- Instanced meshes for satellite groups; GPU point cloud for the long tail.
- Web Worker for SGP4 propagation batch (posts positions to main thread each frame at 10 Hz, interpolated on GPU).
- Frustum culling + LOD (points → billboards → mesh) based on camera distance.
- Suspense boundaries per data feed; a feed outage shows "SIGNAL LOST" on that HUD block, doesn't crash the scene.

**Files added**
```text
src/routes/index.tsx                 # replace placeholder with tactical console
src/routes/api/public/health.ts      # feed status probe
src/lib/feeds/
  neo.functions.ts                   # NeoWs + CAD
  sbdb.functions.ts                  # orbital elements on-demand
  horizons.functions.ts              # spacecraft ephemerides
  spaceweather.functions.ts          # DONKI + SWPC
  iss.functions.ts
  tle.functions.ts                   # Celestrak group fetch + cache
src/scene/
  Scene.tsx                          # <Canvas> + postprocessing stack
  Earth.tsx  Sun.tsx  Planets.tsx
  SatelliteSwarm.tsx                 # instanced + point cloud
  NeoVectors.tsx  OrbitRibbons.tsx
  Spacecraft.tsx  SolarWind.tsx
  Starfield.tsx  CRTEffects.tsx
src/workers/sgp4.worker.ts
src/hud/
  TopBar.tsx  LeftRail.tsx  RightReadout.tsx  BottomTicker.tsx
  BootSequence.tsx  ViewToggle.tsx
src/state/useTacticalStore.ts
src/lib/kepler.ts                    # NEO orbit propagator
src/styles.css                       # amber CRT tokens, scanline layer
```

**Design tokens** added to `styles.css`: `--amber`, `--amber-glow`, `--hot-orange`, `--alert-red`, `--phosphor-dim`, `--grid`, `--scan-line`, plus gradients and box-shadow glow presets. Fonts loaded via `<link>` in `__root.tsx` head (VT323 + JetBrains Mono).

**SEO / head**: unique `head()` on `/` — title "EARTH SPACE MONITOR // SENTINEL", description, og/twitter.

## Build order

1. Enable Cloud + store `NASA_API_KEY`. Add design tokens, fonts, CRT effect layer.
2. Boot sequence + shell (TopBar / LeftRail / RightReadout / BottomTicker) with static mock data.
3. WebGL scene skeleton (starfield, Earth, Sun, camera controls, postprocessing).
4. Feed server functions + TanStack Query hooks with normalized DTOs.
5. ISS + NEO vectors + close-approach threat board (first live data on screen).
6. TLE ingestion + SGP4 worker + instanced satellite swarm (ISS/GPS/Starlink toggles).
7. Heliocentric view: planets, Horizons spacecraft, NEO orbit ribbons, solar wind pulse.
8. View toggle transition, polish (chromatic aberration, flicker, selection reticle, ticker), perf pass to 60fps at 15k sats.

Publishing after step 5 gives a compelling first milestone; full vision lands after step 8.
