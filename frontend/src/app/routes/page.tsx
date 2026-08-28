"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import SafetyMap from "@/components/SafetyMap";
import { Compass, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function RoutesPage() {
  const { 
    user, location, setMockRouteDeviation
  } = useAuth();

  const [journeyActive, setJourneyActive] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState("Ring Road Metro Plaza");
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [selectedRoute, setSelectedRoute] = useState<"shortest" | "safest" | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

  // Fetch Safe Routes
  const handleSearchRoutes = async () => {
    // New Delhi Coordinates offsets for routes simulation
    const originLat = 28.6139;
    const originLng = 77.2090;
    const destLat = 28.6190;
    const destLng = 77.2180;
    
    try {
      const data = await api.fetchSafeRoutes(originLat, originLng, destLat, destLng);
      setRouteInfo(data);
      setSelectedRoute("safest"); // auto select safe path
      
      const places = await api.fetchNearbySafePlaces(location.lat, location.lng);
      setNearbyPlaces(places);
    } catch (err) {
      console.error(err);
    }
  };

  // Guard users
  if (!user || user.role !== "user") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-pink-500" /> Proactive Safe Route Planner
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Calculates lit, crowded, and patrolled pathways instead of just short routes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Starting Point (Current Location)</label>
            <input
              type="text"
              disabled
              value="Main Office Corridor (28.61390, 77.20900)"
              className="w-full bg-zinc-900 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-xs text-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Enter Destination</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
                placeholder="e.g. Ring Road Metro Plaza"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-white"
              />
              <button
                onClick={handleSearchRoutes}
                className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>

        {routeInfo && (
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <SafetyMap
              userLat={location.lat}
              userLng={location.lng}
              activeRoute={selectedRoute}
              safePlaces={nearbyPlaces}
            />

            {/* Route Comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Safest route card */}
              <div 
                onClick={() => setSelectedRoute("safest")}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedRoute === "safest" 
                    ? "bg-emerald-950/20 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> RECOMMENDED PATH
                  </span>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
                    Safety: {routeInfo.safest_route.safety_score}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{routeInfo.safest_route.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Distance: {routeInfo.safest_route.distance_km}km • Time: {routeInfo.safest_route.duration_mins} mins</p>
                
                <div className="mt-3 space-y-1.5 text-[10px] border-t border-zinc-800/80 pt-2 text-zinc-400 font-medium">
                  <p>💡 Lighting: {routeInfo.safest_route.lighting_rating}</p>
                  <p>👥 Crowd: {routeInfo.safest_route.crowd_density}</p>
                  <p>👮 Security: {routeInfo.safest_route.police_presence}</p>
                </div>
              </div>

              {/* Shortest route card */}
              <div 
                onClick={() => setSelectedRoute("shortest")}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedRoute === "shortest" 
                    ? "bg-red-950/20 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.15)]" 
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">SHORTEST PATH</span>
                  <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 rounded font-bold font-mono">
                    Safety: {routeInfo.shortest_route.safety_score}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{routeInfo.shortest_route.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Distance: {routeInfo.shortest_route.distance_km}km • Time: {routeInfo.shortest_route.duration_mins} mins</p>
                
                <div className="mt-3 space-y-1 text-[10px] border-t border-zinc-800/80 pt-2 text-red-400 font-semibold">
                  {routeInfo.shortest_route.risk_warnings.map((w: string, idx: number) => (
                    <p key={idx}>⚠️ {w}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip monitoring activation */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setJourneyActive(!journeyActive);
                  if (!journeyActive) {
                    setMockRouteDeviation(false);
                    alert("Trip safety monitoring started! AI is evaluating coordinates path deviation.");
                  } else {
                    alert("Journey ended. Status safe.");
                  }
                }}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                  journeyActive 
                    ? "bg-amber-600 hover:bg-amber-500 text-white" 
                    : "bg-pink-600 hover:bg-pink-500 text-white"
                }`}
              >
                {journeyActive ? "Stop Trip Monitoring" : "Start Active Trip Monitoring"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
