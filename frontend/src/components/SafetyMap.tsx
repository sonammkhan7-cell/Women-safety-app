"use client";

import React from "react";
import { Shield, Home, ShieldAlert, Crosshair } from "lucide-react";

interface SafetyMapProps {
  userLat: number;
  userLng: number;
  onLocationMove?: (lat: number, lng: number) => void;
  activeRoute?: "shortest" | "safest" | null;
  safePlaces?: Array<{ name: string; type: string; latitude: number; longitude: number }>;
}

export default function SafetyMap({
  userLat,
  userLng,
  onLocationMove,
  activeRoute = null,
  safePlaces = [],
}: SafetyMapProps) {
  // Convert lat/lng to SVG viewBox coordinates (200,200 to 800,500)
  // Scale mapping using New Delhi base as center
  const centerLat = 28.6139;
  const centerLng = 77.2090;

  const getXY = (lat: number, lng: number) => {
    const scale = 30000; // coordinate scaling multiplier
    const x = 500 + (lng - centerLng) * scale;
    const y = 250 - (lat - centerLat) * scale;
    // Bound coordinates within viewBox [0, 0, 1000, 500]
    return {
      x: Math.max(50, Math.min(950, x)),
      y: Math.max(50, Math.min(450, y)),
    };
  };

  const userPos = getXY(userLat, userLng);

  // Default routes SVG paths
  const originXY = getXY(28.6139, 77.2090); // Main Office
  const destXY = getXY(28.6190, 77.2180);   // Home

  // Safe path: loops via populated avenues
  const safePathString = `M ${originXY.x} ${originXY.y} Q 400 400, 600 350 T ${destXY.x} ${destXY.y}`;
  // Shortest path: direct but risky alleyway
  const shortPathString = `M ${originXY.x} ${originXY.y} L 550 200 L ${destXY.x} ${destXY.y}`;

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onLocationMove) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel click coordinates back to lat/lng scale
    const scale = 30000;
    const viewWidth = rect.width;
    const viewHeight = rect.height;
    
    // Adjust coordinates based on SVG coordinate space scaling
    const svgX = (clickX / viewWidth) * 1000;
    const svgY = (clickY / viewHeight) * 500;

    const clickedLng = centerLng + (svgX - 500) / scale;
    const clickedLat = centerLat - (svgY - 250) / scale;

    onLocationMove(clickedLat, clickedLng);
  };

  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-inner">
      <div className="absolute top-3 left-3 z-10 glass-panel px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 text-zinc-400">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Interactive Live Tracking Grid
      </div>
      
      {onLocationMove && (
        <div className="absolute bottom-3 right-3 z-10 glass-panel px-2.5 py-1 rounded-full text-[10px] text-zinc-500">
          Click map to simulate walking
        </div>
      )}

      <svg
        className="w-full h-full cursor-crosshair select-none"
        viewBox="0 0 1000 500"
        onClick={handleMapClick}
      >
        {/* Background Grid Lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Map Streets / Roads */}
        <path
          d="M 50 250 L 950 250 M 500 50 L 500 450 M 150 100 L 850 400 M 150 400 L 850 100"
          stroke="#3f3f46"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 50 250 L 950 250 M 500 50 L 500 450 M 150 100 L 850 400 M 150 400 L 850 100"
          stroke="#18181b"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Labels for Streets */}
        <text x="70" y="240" fill="#71717a" fontSize="10" fontWeight="600">Ring Road Avenue</text>
        <text x="410" y="80" fill="#71717a" fontSize="10" fontWeight="600">Police Patrol lane</text>
        <text x="210" y="380" fill="#ef4444" fontSize="10" fontWeight="700" opacity="0.6">Dark Alleyway Zone</text>

        {/* Shortest Route (Risky) */}
        {activeRoute === "shortest" && (
          <path
            d={shortPathString}
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8,5"
            className="animate-[dash_2s_linear_infinite]"
          />
        )}

        {/* Safest Route (Recommended) */}
        {activeRoute === "safest" && (
          <path
            d={safePathString}
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          />
        )}

        {/* Marker: Start/Office */}
        <circle cx={originXY.x} cy={originXY.y} r="8" fill="#a1a1aa" stroke="#52525b" strokeWidth="2" />
        <text x={originXY.x - 20} y={originXY.y - 12} fill="#a1a1aa" fontSize="9" fontWeight="bold">Office (Start)</text>

        {/* Marker: Destination/Home */}
        <circle cx={destXY.x} cy={destXY.y} r="8" fill="#ec4899" stroke="#db2777" strokeWidth="2" />
        <text x={destXY.x - 20} y={destXY.y - 12} fill="#ec4899" fontSize="9" fontWeight="bold">Home (Goal)</text>

        {/* Safe Haven Assets */}
        {safePlaces.map((place, idx) => {
          const pt = getXY(place.latitude, place.longitude);
          const isPolice = place.type === "police";
          return (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                fill={isPolice ? "#2563eb" : "#059669"}
                opacity="0.85"
                className="hover:scale-125 transition-transform"
              />
              <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" />
            </g>
          );
        })}

        {/* User Location Pulsing Dot */}
        <g>
          <circle
            cx={userPos.x}
            cy={userPos.y}
            r="16"
            fill="#ec4899"
            opacity="0.25"
            className="animate-ping"
          />
          <circle
            cx={userPos.x}
            cy={userPos.y}
            r="7"
            fill="#ec4899"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]"
          />
        </g>
      </svg>
    </div>
  );
}
