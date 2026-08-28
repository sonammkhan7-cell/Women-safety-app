"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/api";

export default function ChatPage() {
  const { 
    user, location, setSosCountdownOpen, setFakeCallOpen 
  } = useAuth();

  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "bot", text: "Hello! I am your safety companion. You can ask me for safe routes, excusing calls, or query nearby help stations. How can I protect you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Chat message submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.askChatbot(userText, location.lat, location.lng);
      setChatMessages((prev) => [
        ...prev, 
        { 
          sender: "bot", 
          text: res.response, 
          actions: res.suggested_actions,
          places: res.nearby_safe_places 
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I lost connection to the safety network. Please check again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Guard users
  if (!user || user.role !== "user") {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-[520px]">
      {/* Header info */}
      <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
          <MessageSquare className="w-4.5 h-4.5 text-pink-500 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white">AI Safety Companion</h3>
          <p className="text-[10px] text-zinc-500">Online • Active Threat Prediction Engine</p>
        </div>
      </div>

      {/* Chat Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
        {chatMessages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-slide-up`}
          >
            <span className="text-[9px] text-zinc-500 mb-1 uppercase tracking-wider font-semibold">
              {msg.sender === "user" ? "You" : "Safety Agent"}
            </span>
            
            <div className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed ${
              msg.sender === "user" 
                ? "bg-pink-600 text-white rounded-tr-none shadow-md shadow-pink-950/20" 
                : "bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none"
            }`}>
              {msg.text}

              {/* Places recommendation links */}
              {msg.places && (
                <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2">
                  {msg.places.map((place: any, pIdx: number) => (
                    <div key={pIdx} className="bg-zinc-950/60 p-2 rounded border border-zinc-800">
                      <span className="font-bold text-[10px] text-emerald-400 block">{place.name}</span>
                      <span className="text-[9px] text-zinc-500">{place.address}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions suggest options */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.actions.map((act: string, actIdx: number) => (
                  <button
                    key={actIdx}
                    onClick={() => {
                      if (act.includes("Fake Call")) {
                        setFakeCallOpen(true);
                      } else if (act.includes("SOS")) {
                        setSosCountdownOpen(true);
                      } else {
                        setChatInput(act);
                      }
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer"
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {chatLoading && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce delay-150"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce delay-300"></span>
            AI Agent typing...
          </div>
        )}
      </div>

      {/* Input field */}
      <form onSubmit={handleChatSubmit} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask e.g. Is my current area safe? Show emergency places."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-white"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-xl bg-pink-600 hover:bg-pink-500 flex items-center justify-center text-white transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
