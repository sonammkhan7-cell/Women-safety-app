"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Plus, Trash2, HeartHandshake, Copy } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactsPage() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  // Load user contacts
  const loadContacts = async () => {
    try {
      const list = await api.getContacts();
      setContacts(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Load live tracking link
  const loadTrackingLink = async () => {
    try {
      const data = await api.getTrackingLink();
      setTrackingLink(data.tracking_url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user && user.role === "user") {
      loadContacts();
      loadTrackingLink();
    }
  }, [user]);

  // Add a trusted contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactMsg("");
    if (!newContactName || !newContactPhone) {
      setContactMsg("Name and Phone are required.");
      return;
    }
    try {
      await api.addContact({
        name: newContactName,
        phone: newContactPhone,
        email: newContactEmail || undefined,
        priority: 1,
      });
      setNewContactName("");
      setNewContactPhone("");
      setNewContactEmail("");
      setContactMsg("Contact added successfully!");
      loadContacts();
    } catch (err: any) {
      setContactMsg(err.message || "Failed to add contact.");
    }
  };

  // Remove trusted contact
  const handleDeleteContact = async (id: number) => {
    try {
      await api.deleteContact(id);
      loadContacts();
    } catch (err) {
      console.error(err);
    }
  };

  // Copy unique live tracking url to clipboard
  const handleCopyLink = () => {
    if (!trackingLink) return;
    navigator.clipboard.writeText(trackingLink);
    alert("Tracking link copied to clipboard!");
  };

  // Guard users
  if (!user || user.role !== "user") {
    return null;
  }

  return (
    <div className="space-y-6">
      
      {/* Live Link generator panel */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-3.5">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-pink-500" /> Share Live Tracking Link
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Generate a secure encrypted link to share your GPS path directly with family.</p>
        </div>

        {trackingLink ? (
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={trackingLink}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        ) : (
          <button
            onClick={loadTrackingLink}
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
          >
            Generate Sharing Link
          </button>
        )}
      </div>

      {/* Manage contacts form and list */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-500" /> Trusted Emergency Contacts
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Manage up to 5 guardians who receive SMS alerts during a panic incident.</p>
        </div>

        {/* Contacts insert form */}
        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
          <input
            type="text"
            required
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            placeholder="Guardian Name"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-white"
          />
          <input
            type="text"
            required
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            placeholder="Phone: +91-9999999999"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-white"
          />
          <input
            type="email"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            placeholder="Email (Optional)"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-white"
          />
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Guardian
          </button>
        </form>

        {contactMsg && (
          <p className="text-xs font-semibold text-center text-pink-400 bg-pink-950/20 border border-pink-900/30 p-2.5 rounded-lg">
            {contactMsg}
          </p>
        )}

        {/* Contacts table display */}
        <div className="space-y-2 pt-2">
          {contacts.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No emergency contacts configured yet. Add one above.</p>
          ) : (
            contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{contact.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{contact.phone} • {contact.email || "No email"}</p>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950/30 hover:border-red-900/40 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
