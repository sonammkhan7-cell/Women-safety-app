"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  location: { lat: number; lng: number };
  setLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  refreshUser: () => Promise<void>;
  mockShaking: boolean;
  setMockShaking: (val: boolean) => void;
  mockAudioTranscript: string;
  setMockAudioTranscript: (val: string) => void;
  mockRouteDeviation: boolean;
  setMockRouteDeviation: (val: boolean) => void;
  riskEvaluation: any;
  runManualRiskCheck: () => Promise<void>;
  sosCountdownOpen: boolean;
  setSosCountdownOpen: (val: boolean) => void;
  fakeCallOpen: boolean;
  setFakeCallOpen: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: New Delhi
  
  // Risk triggers
  const [mockShaking, setMockShaking] = useState(false);
  const [mockAudioTranscript, setMockAudioTranscript] = useState("");
  const [mockRouteDeviation, setMockRouteDeviation] = useState(false);
  const [riskEvaluation, setRiskEvaluation] = useState<any>(null);
  const [sosCountdownOpen, setSosCountdownOpen] = useState(false);
  const [fakeCallOpen, setFakeCallOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Track browser geolocation if permitted
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Using default simulation coordinates.");
        }
      );
    }
  }, []);

  const runManualRiskCheck = useCallback(async () => {
    if (!user) return;
    try {
      const evaluation = await api.runRiskCheck({
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date().toISOString(),
        device_motion: mockShaking ? "shaking" : "stationary",
        audio_transcript: mockAudioTranscript || undefined,
        route_deviation: mockRouteDeviation,
      });
      setRiskEvaluation(evaluation);
      // Refresh status on user
      const freshUser = await api.getMe();
      setUser(freshUser);
    } catch (err) {
      console.error("Risk assessment failed:", err);
    }
  }, [user, location, mockShaking, mockAudioTranscript, mockRouteDeviation]);

  // Periodic location posting and background risk checks when user is logged in
  useEffect(() => {
    if (!user || user.role !== "user") return;

    // Initial check
    runManualRiskCheck();

    const interval = setInterval(async () => {
      try {
        // Log coordinates
        await api.logLocation(location.lat, location.lng);
        // Run risk check
        await api.runRiskCheck({
          latitude: location.lat,
          longitude: location.lng,
          timestamp: new Date().toISOString(),
          device_motion: mockShaking ? "shaking" : "stationary",
          audio_transcript: mockAudioTranscript || undefined,
          route_deviation: mockRouteDeviation,
        });
        
        // Refresh local user variables
        const freshUser = await api.getMe();
        setUser(freshUser);
      } catch (err) {
        console.error("Background tracker error:", err);
      }
    }, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, [user, location, mockShaking, mockAudioTranscript, mockRouteDeviation, runManualRiskCheck]);

  const login = async (credentials: any) => {
    await api.login(credentials);
    await refreshUser();
  };

  const register = async (data: any) => {
    await api.register(data);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setRiskEvaluation(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        location,
        setLocation,
        refreshUser,
        mockShaking,
        setMockShaking,
        mockAudioTranscript,
        setMockAudioTranscript,
        mockRouteDeviation,
        setMockRouteDeviation,
        riskEvaluation,
        runManualRiskCheck,
        sosCountdownOpen,
        setSosCountdownOpen,
        fakeCallOpen,
        setFakeCallOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
