# Women Safety Guardian Agent

Women Safety Guardian Agent is a full-stack, deployment-ready AI safety application. It proactively monitors risk factor patterns (device motion anomalies, route deviation, speech distress words) and provides emergency assistance, including simulated fake incoming calls, real-time geolocating sharing, and trusted guardian SMS notifications.

---

## 🚀 Key Features

1. **AI Risk Assessment Engine**: Computes dynamic safety threat indexes based on device shaking, late-night transit, route deviation, and distress voice transcripts.
2. **Multi-Tab Dashboard Portal**:
   - **SOS Panel (Home)**: High-visibility SOS button with a 3-second mistake cancellation countdown.
   - **Safe Routes**: Proactively plots crowded, well-lit, and patrolled routes compared to risky direct alleyways.
   - **AI Chat Copilot**: Immediate advice, safe havens directories lookup, and Excusing Calls triggers.
   - **Guardians**: Manage emergency phone contacts (up to 5) and copy live GPS coordinates sharing links.
3. **Watcher Dashboard (Guardian View)**: Real-time map displaying the monitored user's path history and active danger signals.
4. **Excusing Fake Call Simulator**: Full-screen overlay that mocks an incoming ring from a family guardian. If accepted, displays dialog scripts to excuse the user from discomfort.
5. **Robust Geolocation Simulation**: Custom interactive SVG grid map enabling clicking to emulate walking to verify tracking.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons.
- **Backend**: FastAPI (Python), SQLAlchemy ORM.
- **Database**: SQLite (local dev), seamlessly switchable to PostgreSQL.
- **AI Engine**: Google Gemini API integration (with rule-based fallback).
- **APIs**: Twilio SMS client, Google Maps API (with interactive mock integrations).

---

## 📂 Project Structure

```
women-safety-guardian/
├── backend/
│   ├── app/
│   │   ├── api/             # API Endpoints (auth, routes, safety, chat)
│   │   ├── core/            # Configuration, Security, DB session
│   │   ├── models/          # SQLAlchemy schemas (User, Contact, Alert, LocationLog)
│   │   ├── schemas/         # Pydantic validation models
│   │   ├── services/        # Business logic & AI Agents
│   │   │   ├── agents.py    # Risk Assessment, Route Safety, Guardian agents
│   │   │   ├── maps.py      # Google Maps / Mock Maps Service
│   │   │   └── sms.py       # Twilio / Mock SMS Service
│   │   └── main.py          # FastAPI Entrypoint
│   ├── tests/               # Pytest API unit test scripts
│   ├── requirements.txt     # Python Dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js Pages & global styles
│   │   ├── components/      # SVG maps, FakeCall overlay, SOS countdown components
│   │   ├── lib/             # API Client wrapper
│   │   └── context/         # Auth, Geolocation, and Risk State manager
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🏁 Startup Instructions

### 1. Backend Server Setup

Navigate to the `backend/` directory:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
# Windows PowerShell
python -m venv venv
# Enable scripts if permitted:
.\venv\Scripts\Activate.ps1
```

Install python dependencies:
```bash
.\venv\Scripts\pip.exe install -r requirements.txt
```

Launch the FastAPI application:
```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
- API will run locally at: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`

#### Run Tests
Ensure all units are operational:
```bash
.\venv\Scripts\python.exe -m pytest -s
```

---

### 2. Frontend Setup

Navigate to the `frontend/` directory:
```bash
cd ../frontend
```

Install npm dependencies:
```bash
npm install
```

Launch the development build:
```bash
npm run dev
```
- Open `http://localhost:3000` in your web browser.

---

## ⚙️ Environment Configurations

Create a `.env` file in the `backend/` folder following this structure:
```env
# backend/.env
SECRET_KEY=your-production-jwt-signing-secret
DATABASE_URL=sqlite:///./women_safety.db

# Live Integrations (Optional; falls back to console mocks if empty)
GEMINI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GOOGLE_MAPS_API_KEY=
```

---

## 🛡️ Verification Walks

1. **Self-Safety Dashboard**:
   - Register a **User** account.
   - Set up **Trusted Emergency Contacts** in the Guardians tab.
   - Click the pulsing red **SOS button**. A 3-second countdown will start. Once complete, it alerts your contact list via console/SMS.
2. **Excusing Calls**:
   - Trigger the **Fake Call Overlay** button. Accept the call to read through safe excusing dialogue prompts.
3. **Route Check**:
   - Go to the **Routes** tab, enter a destination (e.g. "Ring Road"), and click Calculate. Compare the safe path vs shortest path.
4. **Guardian Watcher Mode**:
   - Open a secondary browser session. Log in as a **Guardian**.
   - Input the monitored User's ID and verify their tracking path history instantly on the dashboard map.
