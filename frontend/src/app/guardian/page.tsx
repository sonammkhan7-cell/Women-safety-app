"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import SafetyMap from "@/components/SafetyMap";
import { Shield, AlertOctagon, Search } from "lucide-react";
import { api } from "@/lib/api";

export default function GuardianPage() {
  const { user } = useAuth();

  const [searchTargetId, setSearchTargetId] = useState("");
  const [monitoredLogs, setMonitoredLogs] = useState<any[]>([]);
  const [monitoredAlerts, setMonitoredAlerts] = useState<any[]>([]);
  const [monitoredUser, setMonitoredUser] = useState<any>(null);
  const [guardianError, setGuardianError] = useState("");

  // Search user location logs for Guardian Dashboard
  const handleSearchGuardianLogs = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardianError("");
    setMonitoredUser(null);
    if (!searchTargetId.trim()) return;

    try {
      const targetUserId = parseInt(searchTargetId);
      if (isNaN(targetUserId)) {
        setGuardianError("Please enter a valid numeric User ID.");
        return;
      }

      // Fetch logs and alerts
      const logs = await api.getLocationLogs(targetUserId);
      const alerts = await api.getActiveAlerts(); // returns alerts

      if (logs.length === 0) {
        setGuardianError("No tracking history found for this user ID.");
        return;
      }

      const activeAlerts = alerts.filter((a: any) => a.user_id === targetUserId && a.status === "ACTIVE");

      setMonitoredLogs(logs);
      setMonitoredAlerts(activeAlerts);

      // Select the latest coordinate log as simulated location
      const latestCoord = logs[0];
      setMonitoredUser({
        name: "Monitored User",
        lat: latestCoord.latitude,
        lng: latestCoord.longitude,
        safety_status: activeAlerts.length > 0 ? "DANGER" : "SAFE",
      });
    } catch (err: any) {
      setGuardianError("Failed to fetch guardian tracking data.");
    }
  };

  // Guard guardians
  if (!user || user.role !== "guardian") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-pink-500" /> Guardian Safety Tracking Desk
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Enter a user's unique Identification number to fetch their active tracking link and movement logs.</p>
        </div>

        {/* ID search form */}
        <form onSubmit={handleSearchGuardianLogs} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={searchTargetId}
              onChange={(e) => setSearchTargetId(e.target.value)}
              placeholder="Enter Monitored User ID (e.g. 1)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-xs focus:outline-none focus:border-pink-500 text-white"
            />
          </div>
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-6 rounded-xl text-xs transition-all cursor-pointer"
          >
            Locate User
          </button>
        </form>

        {guardianError && (
          <p className="text-xs text-rose-500 font-semibold text-center bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg">
            {guardianError}
          </p>
        )}

        {monitoredUser && (
          <div className="space-y-4 pt-2">
            {/* Status dashboard bar */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${monitoredUser.safety_status === "DANGER"
              ? "bg-red-950/30 border-red-500/40 text-red-400 animate-pulse"
              : "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
              }`}>
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5" />
                <div>
                  <h4 className="text-xs font-bold">User Status: {monitoredUser.safety_status}</h4>
                  <p className="text-[10px] opacity-80">
                    {monitoredUser.safety_status === "DANGER"
                      ? "CRITICAL: SOS signal active! Check position log."
                      : "Status safe. Location logs updated."}
                  </p>
                </div>
              </div>
            </div>

            <SafetyMap
              userLat={monitoredUser.lat}
              userLng={monitoredUser.lng}
            />

            {/* Location Log Trail */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Historical Tracking Log Trail</h3>
              <div className="max-h-[160px] overflow-y-auto space-y-1.5 border border-zinc-900 p-2 rounded-xl">
                {monitoredLogs.map((log) => (
                  <div key={log.id} className="bg-zinc-900/40 border border-zinc-800/80 p-2.5 rounded-lg flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Lat: {log.latitude.toFixed(5)} • Lng: {log.longitude.toFixed(5)}</span>
                    <span className="text-[9px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
