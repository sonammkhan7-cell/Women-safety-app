"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, X } from "lucide-react";

interface SOSCountdownProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SOSCountdown({ isOpen, onCancel, onConfirm }: SOSCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCount(3);
      return;
    }

    if (count === 0) {
      onConfirm();
      return;
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, count, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-950/95 backdrop-blur-md text-white">
      {/* Glow Backing */}
      <div className="absolute w-96 h-96 bg-red-600/20 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <AlertOctagon className="w-16 h-16 text-red-500 animate-bounce mb-6" />
        
        <h2 className="text-3xl font-extrabold tracking-tight uppercase mb-2">
          Activating Emergency SOS
        </h2>
        <p className="text-red-300 text-sm max-w-sm mb-12 leading-relaxed">
          Alerting all guardians, transmitting your live location tracker, and recording surrounding audio evidence.
        </p>

        {/* Big Countdown Badge */}
        <div className="w-40 h-40 rounded-full border-4 border-red-500/30 flex items-center justify-center mb-16 relative">
          <div className="absolute inset-2 rounded-full border border-red-500/20 animate-ping"></div>
          <span className="text-7xl font-black text-white font-mono">{count}</span>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-zinc-950 font-bold hover:bg-zinc-100 active:scale-95 transition-all shadow-2xl cursor-pointer"
        >
          <X className="w-5 h-5 text-zinc-950" /> Cancel (Mistake)
        </button>
      </div>
    </div>
  );
}
