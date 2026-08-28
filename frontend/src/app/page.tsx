"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import SafetyMap from "@/components/SafetyMap";
import { 
  Shield, PhoneCall, AlertOctagon, Settings, Zap, Volume2
} from "lucide-react";
import { api } from "@/lib/api";

export default function HomePage() {
  const { 
    user, location, setLocation,
    mockShaking, setMockShaking, mockAudioTranscript, setMockAudioTranscript,
    mockRouteDeviation, setMockRouteDeviation, riskEvaluation, runManualRiskCheck,
    setSosCountdownOpen, setFakeCallOpen
  } = useAuth();

  // Simulating dragging user dot on map
  const handleLocationChangeOnMap = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    if (user && user.role === "user") {
      api.logLocation(lat, lng);
    }
  };

  // Guard users
  if (!user || user.role !== "user") {
    return null; // layout handles redirections/auth views
  }

  return (
    <div className="space-y-6">
      {/* Safety Score Card & Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">AI Safety Threat Score</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                (riskEvaluation?.risk_score || 0) >= 70 ? "bg-red-950/60 border border-red-800/30 text-red-400" :
                (riskEvaluation?.risk_score || 0) >= 35 ? "bg-amber-950/60 border border-amber-800/30 text-amber-400" :
                "bg-emerald-950/60 border border-emerald-800/30 text-emerald-400"
              }`}>
                {riskEvaluation?.risk_level || "LOW RISK"}
              </span>
            </div>
            
            <div className="flex items-end gap-3 mt-2">
              <span className="text-5xl font-black text-white">{100 - (riskEvaluation?.risk_score || 10)}%</span>
              <span className="text-zinc-500 text-sm font-medium pb-1">Safety Index</span>
            </div>
            
            <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
              Recommendation: {riskEvaluation?.recommended_action || "Coordinates look normal. Safe path recommended."}
            </p>
          </div>

          <div className="mt-5 border-t border-zinc-800 pt-3 flex flex-wrap gap-2">
            {riskEvaluation?.risk_factors?.map((f: string, i: number) => (
              <span key={i} className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                {f}
              </span>
            )) || (
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                No active anomalies detected
              </span>
            )}
          </div>
        </div>

        {/* Fake call button trigger panel */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 mb-2">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Fake Call Deterrent</h3>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
              Simulate an incoming voice call from your guardian to excuse yourself safely.
            </p>
          </div>
          <button
            onClick={() => setFakeCallOpen(true)}
            className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            Trigger Call Overlay
          </button>
        </div>
      </div>

      {/* Giant Circular Panic Button */}
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl relative">
        <div className="absolute top-4 left-4 flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase">
          <Zap className="w-3.5 h-3.5 text-zinc-500" /> SOS Panel
        </div>
        <button
          onClick={() => setSosCountdownOpen(true)}
          className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 active:scale-95 transition-all text-white flex flex-col items-center justify-center animate-sos-pulse border-4 border-red-500/20 shadow-[0_10px_40px_rgba(239,68,68,0.3)] select-none cursor-pointer"
        >
          <AlertOctagon className="w-10 h-10 text-white mb-1" />
          <span className="text-sm font-black tracking-widest uppercase">Panic SOS</span>
        </button>
        <p className="text-[10px] text-zinc-500 mt-4 text-center">
          Instantly shares GPS tracking coordinates and triggers audio distress recording.
        </p>
      </div>

      {/* Interactive simulation controls panel */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-zinc-400" /> AI Anomaly Simulators
          </h3>
          <span className="text-[9px] bg-pink-950 text-pink-400 px-2 py-0.5 rounded font-mono font-bold">Local Prototyping</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shake simulator toggle */}
          <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <div>
              <h4 className="text-xs font-bold text-zinc-300">Device Shaking Simulator</h4>
              <p className="text-[10px] text-zinc-500">Simulate sudden dynamic vibrations</p>
            </div>
            <button
              onClick={() => {
                setMockShaking(!mockShaking);
                setTimeout(runManualRiskCheck, 100);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mockShaking 
                  ? "bg-pink-600 text-white" 
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-300"
              }`}
            >
              {mockShaking ? "Shaking ON" : "Turn On"}
            </button>
          </div>

          {/* Route deviation mock toggle */}
          <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <div>
              <h4 className="text-xs font-bold text-zinc-300">Route Deviation Scanner</h4>
              <p className="text-[10px] text-zinc-500">Simulate sudden off-path changes</p>
            </div>
            <button
              onClick={() => {
                setMockRouteDeviation(!mockRouteDeviation);
                setTimeout(runManualRiskCheck, 100);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mockRouteDeviation 
                  ? "bg-pink-600 text-white" 
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-300"
              }`}
            >
              {mockRouteDeviation ? "Deviation ON" : "Turn On"}
            </button>
          </div>
        </div>

        {/* Text anomaly simulator input */}
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-2">
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" /> Simulated Microphone / Distress Words
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mockAudioTranscript}
              onChange={(e) => setMockAudioTranscript(e.target.value)}
              placeholder="e.g. Stop it! Help me, emergency!"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-white"
            />
            <button
              onClick={() => {
                runManualRiskCheck();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
            >
              Verify Text Risk
            </button>
          </div>
        </div>
      </div>

      {/* Map and Active Journey Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-zinc-400" /> Real-time Location Simulator Map
        </h3>
        <SafetyMap 
          userLat={location.lat} 
          userLng={location.lng} 
          onLocationMove={handleLocationChangeOnMap}
        />
        <div className="flex items-center justify-between text-xs bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
          <div>
            <span className="text-zinc-500 font-semibold block">Simulated Latitude</span>
            <span className="font-mono text-zinc-300 font-semibold">{location.lat.toFixed(5)}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-semibold block">Simulated Longitude</span>
            <span className="font-mono text-zinc-300 font-semibold">{location.lng.toFixed(5)}</span>
          </div>
          <button
            onClick={() => handleLocationChangeOnMap(28.6139, 77.2090)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border border-zinc-700/60"
          >
            Reset Location
          </button>
        </div>
      </div>
    </div>
  );
}
