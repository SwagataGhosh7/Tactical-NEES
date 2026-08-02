"use client";

import { useState, useEffect } from "react";
import { useTacticalStore } from "@/state/useTacticalStore";
import { CosmicVisualization } from "@/scene/CosmicVisualization";
import { VRXRCosmicExperience } from "@/scene/VRXRCosmicExperience";

interface CosmicImage {
  id: string;
  title: string;
  description: string;
  url: string;
  category: CosmicCategory;
  distance?: string;
  date?: string;
}

type CosmicCategory = "solar-system" | "interstellar" | "galaxy" | "supernova" | "universe" | "exoplanet";

const categories: { key: CosmicCategory; label: string; description: string }[] = [
  { key: "solar-system", label: "SOLAR SYSTEM", description: "Planets, moons, and local celestial bodies" },
  { key: "interstellar", label: "INTERSTELLAR", description: "Nebulae, star clusters, and deep space" },
  { key: "galaxy", label: "GALAXIES", description: "Distant galaxies and cosmic structures" },
  { key: "supernova", label: "SUPERNOVAE", description: "Stellar explosions and remnants" },
  { key: "universe", label: "OBSERVABLE UNIVERSE", description: "Cosmic microwave background and large-scale structure" },
  { key: "exoplanet", label: "EXOPLANETS", description: "Worlds beyond our solar system" },
];

export function CosmicDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CosmicCategory>("solar-system");
  const [selectedImage, setSelectedImage] = useState<CosmicImage | null>(null);
  const [distanceInput, setDistanceInput] = useState("");
  const [virtualPosition, setVirtualPosition] = useState<{ location: string; description: string; distance: string } | null>(null);
  const [images, setImages] = useState<CosmicImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [show3DVisualization, setShow3DVisualization] = useState(false);
  const [explorationDistance, setExplorationDistance] = useState(0);
  const [xrMode, setXRMode] = useState<"VR" | "AR" | null>(null);

  const layers = useTacticalStore((s) => s.layers);

  useEffect(() => {
    if (isOpen) {
      loadCategoryImages(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  const loadCategoryImages = async (category: CosmicCategory) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${getSearchQuery(category)}&media_type=image`
      );
      const data = await response.json();
      
      const cosmicImages: CosmicImage[] = data.collection.items.slice(0, 12).map((item: any) => ({
        id: item.data[0].nasa_id,
        title: item.data[0].title,
        description: item.data[0].description || "No description available",
        url: item.links[0].href,
        category,
        date: item.data[0].date_created,
      }));
      
      setImages(cosmicImages);
    } catch (error) {
      console.error("Failed to load cosmic images:", error);
      setImages(getFallbackImages(category));
    } finally {
      setLoading(false);
    }
  };

  const getSearchQuery = (category: CosmicCategory): string => {
    const queries: Record<CosmicCategory, string> = {
      "solar-system": "planet solar system",
      "interstellar": "nebula star cluster",
      "galaxy": "galaxy spiral elliptical",
      "supernova": "supernova remnant",
      "universe": "cosmic microwave background universe",
      "exoplanet": "exoplanet",
    };
    return queries[category];
  };

  const getFallbackImages = (category: CosmicCategory): CosmicImage[] => {
    return [
      {
        id: "fallback-1",
        title: `${category.toUpperCase()} Exploration`,
        description: "High-resolution imagery from space telescopes",
        url: `https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop`,
        category,
        distance: "Unknown",
      },
      {
        id: "fallback-2", 
        title: "Deep Space Observation",
        description: "Capturing the wonders of our universe",
        url: `https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&fit=crop`,
        category,
        distance: "Unknown",
      },
    ];
  };

  const handleVirtualExploration = () => {
    const distance = parseFloat(distanceInput);
    if (isNaN(distance) || distance <= 0) {
      alert("Please enter a valid distance in light-years");
      return;
    }

    let location = "";
    let description = "";

    if (distance < 4.3) {
      location = "Alpha Centauri System";
      description = "Our nearest stellar neighbor, approximately 4.3 light-years away";
    } else if (distance < 100) {
      location = "Local Interstellar Cloud";
      description = "The interstellar cloud through which the Solar System is currently moving";
    } else if (distance < 1000) {
      location = "Local Bubble";
      description = "A cavity in the interstellar medium containing our Local Interstellar Cloud";
    } else if (distance < 10000) {
      location = "Orion Arm";
      description = "A minor spiral arm of the Milky Way Galaxy where our Solar System resides";
    } else if (distance < 100000) {
      location = "Milky Way Galaxy";
      description = "Our barred spiral galaxy containing 100-400 billion stars";
    } else if (distance < 2500000) {
      location = "Local Group";
      description = "The galaxy group that includes the Milky Way and Andromeda galaxies";
    } else if (distance < 10000000) {
      location = "Virgo Supercluster";
      description = "A galactic supercluster containing the Local Group";
    } else if (distance < 100000000) {
      location = "Laniakea Supercluster";
      description = "The supercluster that contains the Virgo Supercluster";
    } else {
      location = "Observable Universe Edge";
      description = "The limit of the observable universe, approximately 46.5 billion light-years in radius";
    }

    setVirtualPosition({ location, description, distance: distanceInput });
    setExplorationDistance(distance);
    setShow3DVisualization(true);
  };

  if (!layers.cosmicDashboard) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 z-40 w-52 crt-panel p-3 border border-cyan-400/30 hover:border-cyan-400/60 transition-colors"
      >
        <div className="text-xs font-bold text-cyan-400 neon-text">COSMIC DASHBOARD</div>
        <div className="text-[10px] text-cyan-400/60 mt-1">Explore the Universe</div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 neon-text">COSMIC DASHBOARD</h1>
            <p className="text-sm text-cyan-400/60">Virtual Observatory & Deep Space Explorer</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            CLOSE
          </button>
        </div>

        <div className="mb-8 crt-panel p-4">
          <h2 className="text-sm font-bold text-cyan-400 neon-text mb-3">VIRTUAL EXPLORATION</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-cyan-400/60 block mb-1">DISTANCE (LIGHT-YEARS)</label>
              <input
                type="number"
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value)}
                placeholder="Enter distance..."
                className="w-full bg-black/50 border border-cyan-400/30 px-3 py-2 text-cyan-400 focus:border-cyan-400/60 outline-none"
              />
            </div>
            <button
              onClick={handleVirtualExploration}
              className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/30 transition-colors"
            >
              EXPLORE
            </button>
          </div>

          {virtualPosition && (
            <div className="mt-4 p-3 border border-cyan-400/20 bg-cyan-400/5">
              <div className="text-sm font-bold text-cyan-400">{virtualPosition.location}</div>
              <div className="text-xs text-cyan-400/60 mt-1">{virtualPosition.description}</div>
              <div className="text-[10px] text-cyan-400/40 mt-2">Distance: {virtualPosition.distance} light-years</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShow3DVisualization(true)}
                  className="flex-1 px-4 py-2 bg-cyan-400/20 border border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/30 transition-colors text-xs"
                >
                  3D SIMULATION
                </button>
                <button
                  onClick={() => setXRMode("VR")}
                  className="flex-1 px-4 py-2 bg-purple-500/20 border border-purple-400/60 text-purple-400 hover:bg-purple-500/30 transition-colors text-xs"
                  title="Requires VR headset and WebXR-compatible browser"
                >
                  VR MODE
                </button>
                <button
                  onClick={() => setXRMode("AR")}
                  className="flex-1 px-4 py-2 bg-pink-500/20 border border-pink-400/60 text-pink-400 hover:bg-pink-500/30 transition-colors text-xs"
                  title="Requires mobile device with WebAR support"
                >
                  AR MODE
                </button>
              </div>
              <div className="text-[9px] text-cyan-400/40 mt-2">
                * VR/AR modes require compatible hardware and browsers
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs font-bold border transition-colors whitespace-nowrap ${
                selectedCategory === cat.key
                  ? "bg-cyan-400/20 border-cyan-400/60 text-cyan-400 neon-border"
                  : "border-cyan-400/20 text-cyan-400/60 hover:border-cyan-400/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-cyan-400">
            {categories.find((c) => c.key === selectedCategory)?.label}
          </h3>
          <p className="text-xs text-cyan-400/60 mt-1">
            {categories.find((c) => c.key === selectedCategory)?.description}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-cyan-400/60">
            <div className="text-sm">Loading cosmic imagery...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="cursor-pointer crt-panel overflow-hidden hover:border-cyan-400/60 transition-colors"
              >
                <div className="aspect-video bg-black/50 relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-cyan-400 truncate">{image.title}</div>
                  {image.date && (
                    <div className="text-[10px] text-cyan-400/40 mt-1">
                      {new Date(image.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedImage && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl w-full crt-panel p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 neon-text">{selectedImage.title}</h3>
                  {selectedImage.date && (
                    <div className="text-xs text-cyan-400/60">
                      {new Date(selectedImage.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-cyan-400 hover:text-cyan-400/60 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="mb-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full max-h-[60vh] object-contain border border-cyan-400/20"
                />
              </div>
              <div className="text-sm text-cyan-400/80 max-h-32 overflow-y-auto">
                {selectedImage.description}
              </div>
            </div>
          </div>
        )}

        {show3DVisualization && (
          <CosmicVisualization 
            distance={explorationDistance} 
            onClose={() => setShow3DVisualization(false)} 
          />
        )}

        {xrMode && (
          <VRXRCosmicExperience 
            distance={explorationDistance} 
            onClose={() => setXRMode(null)}
            mode={xrMode}
            onSwitchTo3D={() => setShow3DVisualization(true)}
          />
        )}
      </div>
    </div>
  );
}