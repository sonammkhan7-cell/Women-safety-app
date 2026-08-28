const API_BASE = "http://localhost:8000/api";

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("safety_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    const tokenInfo = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("safety_token", tokenInfo.access_token);
    }
    return tokenInfo;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Unauthorized");
    }
    return res.json();
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("safety_token");
    }
  },

  // Location Logs & Geofence
  async logLocation(latitude: number, longitude: number, speed?: number, bearing?: number) {
    const res = await fetch(`${API_BASE}/location/logs`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ latitude, longitude, speed, bearing }),
    });
    return res.json();
  },

  async getLocationLogs(userId?: number) {
    const url = userId ? `${API_BASE}/location/logs?user_id=${userId}` : `${API_BASE}/location/logs`;
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  async getTrackingLink() {
    const res = await fetch(`${API_BASE}/location/tracking-link`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Contacts
  async getContacts() {
    const res = await fetch(`${API_BASE}/location/contacts`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  async addContact(data: any) {
    const res = await fetch(`${API_BASE}/location/contacts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to add contact");
    }
    return res.json();
  },

  async deleteContact(id: number) {
    const res = await fetch(`${API_BASE}/location/contacts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Alerts & SOS
  async triggerSOS(data: { alert_type: string; location_lat?: number; location_lng?: number; audio_transcript?: string; battery_level?: number }) {
    const res = await fetch(`${API_BASE}/alerts/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getActiveAlerts() {
    const res = await fetch(`${API_BASE}/alerts/active`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  async resolveAlert(id: number) {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return res.json();
  },

  async runRiskCheck(data: { latitude: number; longitude: number; timestamp: string; device_motion?: string; audio_transcript?: string; route_deviation?: boolean }) {
    const res = await fetch(`${API_BASE}/alerts/risk-check`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Maps / Routes
  async fetchSafeRoutes(originLat: number, originLng: number, destLat: number, destLng: number) {
    const res = await fetch(`${API_BASE}/routes/safe?origin_lat=${originLat}&origin_lng=${originLng}&dest_lat=${destLat}&dest_lng=${destLng}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  async fetchNearbySafePlaces(lat: number, lng: number) {
    const res = await fetch(`${API_BASE}/routes/safe-places?lat=${lat}&lng=${lng}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Chat
  async askChatbot(message: string, currentLat?: number, currentLng?: number) {
    const res = await fetch(`${API_BASE}/chat/ask`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message, current_lat: currentLat, current_lng: currentLng }),
    });
    return res.json();
  }
};
