"use client";

import React, { useState, useEffect } from "react";
import { Phone, PhoneOff, User, Volume2, Shield } from "lucide-react";

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FakeCallModal({ isOpen, onClose }: FakeCallModalProps) {
  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">("ringing");
  const [timer, setTimer] = useState(0);
  const [transcriptIndex, setTranscriptIndex] = useState(0);

  const transcripts = [
    "Papa: Hey dear! Where are you right now? Are you on your way home?",
    "You (suggested): Yes, I'm just walking near the Main Street corridor.",
    "Papa: Okay, good. I am watching your live location tracking link. It shows you are about 5 minutes away.",
    "You (suggested): Perfect, I'm heading along the Ring Road now.",
    "Papa: Sounds good. I am waiting outside for you. Keep walking towards the market crossing, I'll see you in a minute.",
    "You (suggested): Yes, I can see the lights. I'll be there in two minutes. Talk to you soon!",
  ];

  useEffect(() => {
    if (!isOpen) {
      setCallState("ringing");
      setTimer(0);
      setTranscriptIndex(0);
      return;
    }

    let interval: NodeJS.Timeout;
    if (callState === "connected") {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
        // Advance dialog every 5 seconds
        if (timer > 0 && timer % 5 === 0 && transcriptIndex < transcripts.length - 1) {
          setTranscriptIndex((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isOpen, callState, timer, transcriptIndex, transcripts.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950 p-8 text-white font-sans animate-fade-in animate-slide-up">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-12 text-center">
        <span className="text-emerald-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5 mb-2 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/30">
          <Shield className="w-3.5 h-3.5" /> Safety Deterrent Call
        </span>
        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-2xl mb-4">
          <User className="w-12 h-12 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Papa (Guardian)</h2>
        <p className="text-zinc-500 text-sm mt-1">
          {callState === "ringing" ? "Incoming Call..." : callState === "connected" ? "Connected" : "Call Ended"}
        </p>
        
        {callState === "connected" && (
          <span className="text-xs text-zinc-400 font-mono mt-2 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {Math.floor(timer / 60).toString().padStart(2, "0")}:{(timer % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Transcript / Dialog Helper */}
      {callState === "connected" && (
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3 text-xs text-pink-400 font-bold uppercase tracking-wider">
            <Volume2 className="w-4 h-4 animate-bounce" /> Recommended Deterrent Dialogue
          </div>
          <p className="text-sm font-medium leading-relaxed text-zinc-200 animate-pulse">
            {transcripts[transcriptIndex]}
          </p>
          <div className="flex gap-1 mt-4">
            {transcripts.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx <= transcriptIndex ? "bg-pink-500" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Button Operations */}
      <div className="mb-16 w-full max-w-sm flex justify-around items-center">
        {callState === "ringing" ? (
          <>
            {/* Decline Button */}
            <button
              onClick={onClose}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            
            {/* Accept Button */}
            <button
              onClick={() => setCallState("connected")}
              className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all animate-ring shadow-[0_4px_20px_rgba(16,185,129,0.4)]"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          </>
        ) : (
          /* Hangup Button */
          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
