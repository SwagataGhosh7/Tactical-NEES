import { create } from "zustand";

export type TacticalView = "geocentric" | "heliocentric";

export interface LayerState {
  iss: boolean;
  starlink: boolean;
  gps: boolean;
  otherSats: boolean;
  neos: boolean;
  spacecraft: boolean;
  solarWind: boolean;
}

export interface TacticalState {
  view: TacticalView;
  booted: boolean;
  layers: LayerState;
  maxMissDistanceAu: number;
  minDiameterM: number;
  selectedId: string | null;
  setView: (view: TacticalView) => void;
  setBooted: (booted: boolean) => void;
  toggleLayer: (key: keyof LayerState) => void;
  setLayers: (layers: Partial<LayerState>) => void;
  setMaxMissDistanceAu: (v: number) => void;
  setMinDiameterM: (v: number) => void;
  setSelectedId: (id: string | null) => void;
}

export const useTacticalStore = create<TacticalState>((set) => ({
  view: "geocentric",
  booted: false,
  layers: {
    iss: true,
    starlink: true,
    gps: true,
    otherSats: false,
    neos: true,
    spacecraft: true,
    solarWind: true,
  },
  maxMissDistanceAu: 0.05,
  minDiameterM: 0,
  selectedId: null,
  setView: (view) => set({ view }),
  setBooted: (booted) => set({ booted }),
  toggleLayer: (key) =>
    set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  setLayers: (layers) =>
    set((s) => ({ layers: { ...s.layers, ...layers } })),
  setMaxMissDistanceAu: (v) => set({ maxMissDistanceAu: v }),
  setMinDiameterM: (v) => set({ minDiameterM: v }),
  setSelectedId: (id) => set({ selectedId: id }),
}));
