"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield, PhoneCall, AlertOctagon, MessageSquare,
  Settings, LogOut, Compass, Zap
} from "lucide-react";
import SOSCountdown from "@/components/SOSCountdown";
import FakeCallModal from "@/components/FakeCallModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    user, loading, login, register, logout, location,
    mockAudioTranscript, runManualRiskCheck,
    sosCountdownOpen, setSosCountdownOpen,
    fakeCallOpen, setFakeCallOpen
  } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  // Auth panel switching
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authRole, setAuthRole] = useState("user");
  const [authError, setAuthError] = useState("");

  // Role guarding and redirects
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "guardian" && pathname !== "/guardian") {
        router.push("/guardian");
      } else if (user.role === "user" && pathname === "/guardian") {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await login({ email: authEmail, password: authPassword });
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials");
    }
  };

  // Registration handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await register({
        name: authName,
        email: authEmail,
        password: authPassword,
        phone: authPhone,
        role: authRole,
      });
      setIsLogin(true);
      setAuthError("Registration successful! Please login.");
    } catch (err: any) {
      setAuthError(err.message || "Registration failed");
    }
  };

  // Confirming SOS Trigger
  const handleSOSConfirm = async () => {
    setSosCountdownOpen(false);
    try {
      await api.triggerSOS({
        alert_type: "SOS_PANIC",
        location_lat: location.lat,
        location_lng: location.lng,
        audio_transcript: mockAudioTranscript || "Emergency SOS manually triggered",
        battery_level: 85,
      });
      runManualRiskCheck();
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve active SOS alert
  const handleResolveSOS = async () => {
    try {
      const active = await api.getActiveAlerts();
      if (active && active.length > 0) {
        await api.resolveAlert(active[0].id);
      }
      runManualRiskCheck();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <Shield className="w-12 h-12 text-pink-500 animate-pulse mb-4" />
        <p className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">Synchronizing Safety Core...</p>
      </div>
    );
  }

  // --- Auth View ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-zinc-800 shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Women Safety Guardian</h1>
            <p className="text-xs text-zinc-400 mt-1">Autonomous Proactive AI Protection Portal</p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="+91-9999999999"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 text-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 text-white"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Select Portal Role</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setAuthRole("user")}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${authRole === "user"
                      ? "bg-pink-950/40 border-pink-500 text-pink-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                  >
                    User (Self-Safety)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthRole("guardian")}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${authRole === "guardian"
                      ? "bg-pink-950/40 border-pink-500 text-pink-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                  >
                    Guardian (Watcher)
                  </button>
                </div>
              </div>
            )}

            {authError && (
              <p className="text-xs text-rose-500 font-semibold bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-950/30 cursor-pointer"
            >
              {isLogin ? "Sign In" : "Register Guardian Account"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            {isLogin ? "New to Safety Guardian?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError("");
              }}
              className="text-pink-500 font-semibold hover:underline"
            >
              {isLogin ? "Register Now" : "Sign In Here"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Guard against flash of incorrect routes before routing takes effect
  if (user.role === "guardian" && pathname !== "/guardian") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <Shield className="w-12 h-12 text-pink-500 animate-pulse mb-4" />
        <p className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">Routing to Watcher Desk...</p>
      </div>
    );
  }

  if (user.role === "user" && pathname === "/guardian") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <Shield className="w-12 h-12 text-pink-500 animate-pulse mb-4" />
        <p className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">Routing to SOS Panel...</p>
      </div>
    );
  }

  // --- Authenticated Layout View ---
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Safety Guardian Agent
              <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono px-1.5 py-0.5 rounded uppercase">
                {user.role}
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500">ID: #{user.id} • Active Connection</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Safety Status Banner */}
          {user.role === "user" && (
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${user.safety_status === "DANGER" ? "bg-red-500 animate-ping" :
                user.safety_status === "WARNING" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`} />
              <span className={`text-xs font-bold ${user.safety_status === "DANGER" ? "text-red-400" :
                user.safety_status === "WARNING" ? "text-amber-400" : "text-emerald-400"
                }`}>
                {user.safety_status === "DANGER" ? "SOS ACTIVE" :
                  user.safety_status === "WARNING" ? "HIGH ALERT" : "SAFE STATUS"}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Screen Panels */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-28">
        {/* Top Critical Alerts Resolver */}
        {user.role === "user" && user.safety_status === "DANGER" && (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between animate-pulse mb-6">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-sm font-bold text-red-300">Active Guardian SOS Alert Transmitting</h3>
                <p className="text-[11px] text-red-400/80">Guardians have been notified with location.</p>
              </div>
            </div>
            <button
              onClick={handleResolveSOS}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Mark Myself Safe
            </button>
          </div>
        )}

        {children}
      </main>

      {/* SOS Countdown overlay */}
      <SOSCountdown
        isOpen={sosCountdownOpen}
        onCancel={() => setSosCountdownOpen(false)}
        onConfirm={handleSOSConfirm}
      />

      {/* Fake Call overlay */}
      <FakeCallModal
        isOpen={fakeCallOpen}
        onClose={() => setFakeCallOpen(false)}
      />

      {/* Bottom Nav Bar (PWA Style Mobile Nav) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 py-3 px-6 flex justify-around items-center">
        {user.role === "user" ? (
          <>
            <Link
              href="/"
              className={`flex flex-col items-center gap-1 transition-all ${pathname === "/" ? "text-pink-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px]">SOS Panel</span>
            </Link>

            <Link
              href="/routes"
              className={`flex flex-col items-center gap-1 transition-all ${pathname === "/routes" ? "text-pink-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Routes</span>
            </Link>

            <Link
              href="/ai-chat"
              className={`flex flex-col items-center gap-1 transition-all ${pathname === "/ai-chat" ? "text-pink-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px]">AI Chat</span>
            </Link>

            <Link
              href="/guardians"
              className={`flex flex-col items-center gap-1 transition-all ${pathname === "/guardians" ? "text-pink-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px]">Guardians</span>
            </Link>
          </>
        ) : (
          <Link
            href="/guardian"
            className={`flex flex-col items-center gap-1 transition-all ${pathname === "/guardian" ? "text-pink-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">Watcher Portal</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
