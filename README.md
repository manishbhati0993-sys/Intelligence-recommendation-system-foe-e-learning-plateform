# EduPulse AI — 3D Intelligence Recommendation System for E-Learning Platform

An intelligent recommendation system featuring interactive 3D WebGL knowledge universe representations of student competency vectors, skill gaps, course affinity graphs, and explainable AI (XAI) multi-factor matching.

Built for **Group 03 — Intelligent Recommendation System for E-Learning Platform**, seamlessly connected to a FastAPI + PostgreSQL backend.

---

## 🌟 Key Features

1. **3D Neural Knowledge Universe (`ThreeNeuralUniverse.jsx`)**:
   - WebGL 3D interactive knowledge topology powered by Three.js and OrbitControls.
   - **Learner Twin Core**: Pulsating icosahedron embedding with orbiting gyroscope rings.
   - **Skill Deficit Nodes**: Real-time color-coded indicators of skill gaps ($>25\%$ crimson, $15-25\%$ amber, $<15\%$ emerald).
   - **Course Nodes**: Radius, radiance, and orbital proximity dynamically scaled by AI Match percentage.
   - **Synaptic Pathways**: Quadratic Bézier curves with animated traveling photon pulses.
   - **Multiple Topologies**: Switch between *Constellation* (spherical galaxy), *Career Highway* (linear roadmap), and *High-Affinity* (close-orbit) presets.

2. **Explainable AI (XAI) Node Inspector (`AiRecommendationInspector.jsx`)**:
   - Slide-over telemetry panel displaying transparent 4-factor scoring breakdown:
     - Target Career Alignment
     - Skill Deficit Gap Closure
     - Cohort Peer Success / Benchmark
     - Difficulty & Pace Fit
   - Dynamic vector reasoning explaining *why* each course was recommended.
   - Direct course enrollment (`POST /api/v1/courses/{id}/start`) and bookmark actions.

3. **Hybrid Recommendation Engine & FastAPI Integration**:
   - Integrated with FastAPI backend (`/api/v1`) using JWT authentication & httpOnly token rotation.
   - Automatic session restoration with graceful fallback to local 6-factor simulation when offline.
   - Real-time interaction tracking (`POST /api/v1/interactions`).

4. **Multiple Frontend Formats Included**:
   - **React + Three.js Application**: Full SPA located in `src/` powered by Vite and Tailwind CSS.
   - **Standalone Single-File WebGL Experience (`edupulse_3d_recommendation.html`)**: Open directly in any modern browser without build tools.
   - **Authentication Portal (`login.html`)**: Complete sign-in/registration with one-click demo login.

---

## 📁 Repository Structure

```
├── .gitignore                   # Standard Git ignore (ignores node_modules, dist, *.zip, .env)
├── README.md                    # Project documentation
├── index.html                   # React app entry point (Vite)
├── api.js                       # Universal API client for EduRecommend backend
├── login.html                   # Authentication portal (Sign In / Register)
├── edupulse_3d_recommendation.html  # Standalone 3D WebGL HTML+CSS+JS frontend
├── package.json                 # Node dependencies and project scripts
├── vite.config.js               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
│
├── src/                         # React SPA source code
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main router, state & session management
│   ├── index.css                # Global styles
│   ├── components/
│   │   ├── ThreeNeuralUniverse.jsx          # 3D Three.js WebGL graph
│   │   ├── AiRecommendationInspector.jsx    # Explainable AI drawer
│   │   ├── RecommendationConstellation.jsx  # Constellation wrapper
│   │   ├── Navbar.jsx                       # Navigation bar with 3D shortcut
│   │   ├── Sidebar.jsx                      # Sidebar with career vector HUD
│   │   ├── CourseCard.jsx                   # Recommendation cards
│   │   └── ...
│   ├── pages/
│   │   ├── AiNeuralUniversePage.jsx         # Dedicated 3D experience page
│   │   ├── RecommendationsPage.jsx          # Recommendations list & 3D toggle
│   │   ├── StudentDashboard.jsx             # Main dashboard
│   │   ├── CourseDetailPage.jsx             # Course details & syllabus
│   │   ├── SkillGapPage.jsx                 # Skill benchmarking
│   │   └── ...
│   ├── services/
│   │   ├── eduApi.js                        # ES module API service for backend
│   │   └── recommendationEngine.js          # Hybrid recommendation engine
│   └── data/
│       └── mockData.js                      # Course taxonomy & learner profiles
│
└── frontend/                    # Drop-in vanilla scripts
    ├── api.js                   # Standalone API client
    └── login.html               # Drop-in login page
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Python 3.10+** (if running the FastAPI backend)

### 2. Frontend Setup (React + Vite)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Running with the FastAPI Backend (Optional)

1. Start your FastAPI server on port 8000:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
2. Interactive API docs will be accessible at: `http://127.0.0.1:8000/docs`.
3. Default demo credentials: `manish@example.com` / `Demo@12345`.
4. The frontend will automatically detect the backend on port 8000, verify the connection via `/health`, and fetch live hybrid recommendations.

### 4. Running Without Build Tools
You can also run the standalone 3D frontend directly:
- Open `edupulse_3d_recommendation.html` in any browser or with VS Code Live Server.

---

## 🛠️ Build for Production

```bash
npm run build
```
Generates a minified, production-ready bundle in the `dist/` directory.

---

## 📜 License
MIT License. Built for Group 03 — *Intelligent Recommendation System for E-Learning Platform*.
