# 🌾 Integrated Farm Management System - Frontend Client (`frontend`)

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0%2B-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss)
![Google Maps](https://img.shields.io/badge/Google_Maps-API_Integration-4285F4?logo=googlemaps)
![Status](https://img.shields.io/badge/Status-100%25_Operational-brightgreen)

The `frontend` directory contains the modern, responsive React 19 + TypeScript single-page client application for **PRJ_533 (Integrated Farm Management System)**. It provides farm managers, agricultural workers, and administrators with interactive dashboards, GIS field sector mapping, real-time soil telemetry charts, microclimate weather forecasts, financial ledgers, and explainable AI decision support.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- **Express Backend API** running on `http://localhost:5000` (see [`backend/README.md`](../backend/README.md))

### 1. Installation
Navigate into the `frontend/` directory and install all npm dependencies:

```bash
cd frontend
npm install
```

### 2. Environment Variables Setup
Create a `.env` file in the `frontend/` directory (or edit existing `.env`):

```env
# Backend REST API Base Endpoint URL
VITE_API_BASE_URL=http://localhost:5000/api

# Google Maps JavaScript API Key (Used for GIS Field Sector Mapping)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Launch Development Server
Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

- **Client URL**: Access the frontend application at **`http://localhost:5173`** (or `http://localhost:3000`).

### 4. Build for Production
To type-check with TypeScript and compile the optimized static production bundle into `dist/`:

```bash
npm run build
```

### 5. Preview Production Build Locally
```bash
npm run preview
```

### 6. Code Quality & Linting
Run Oxlint to check code quality:

```bash
npm run lint
```

---

## 📁 Project & Component Structure

```text
frontend/
├── public/                       # Static public assets (favicon, logos)
├── src/
│   ├── assets/                   # Images, illustrations, icons
│   ├── components/               # Reusable UI component library
│   │   ├── GoogleFieldMap.tsx    # Google Maps JS API + Places Autocomplete GIS map
│   │   ├── StatCard.tsx          # Metric cards with trend indicators
│   │   ├── StatusBadge.tsx       # Standardized status tags & health indicators
│   │   ├── PageHeader.tsx        # Page headers with action buttons
│   │   ├── SearchBar.tsx         # Universal data filtering and search input
│   │   ├── DecisionSupportCard.tsx # Explainable AI recommendation card
│   │   ├── SoilHealthCard.tsx    # Soil chemistry breakdown & score display
│   │   ├── FormModal.tsx         # Accessible popup modal for CRUD forms
│   │   ├── ConfirmDialog.tsx     # Action confirmation dialogs (Delete/Archive)
│   │   └── LoadingSkeleton.tsx   # Placeholder loading UI animations
│   │
│   ├── context/                  # Global React State Contexts
│   │   ├── AuthContext.tsx       # Persistent JWT session, user roles & profile state
│   │   └── ToastContext.tsx      # System toast notifications
│   │
│   ├── pages/                    # 16 Full-Featured Application Page Views
│   │   ├── Login.tsx             # User authentication login view
│   │   ├── Register.tsx          # Account registration with role selection
│   │   ├── Dashboard.tsx         # Executive operational dashboard overview
│   │   ├── Farms.tsx             # Farm entity management (Name, Location, Hectares)
│   │   ├── Fields.tsx            # GIS Field Sector map, boundaries & Places search
│   │   ├── Crops.tsx             # Crop cycle management & Farm -> Field selector
│   │   ├── Soil.tsx              # Soil telemetry, NPK Recharts & health scores
│   │   ├── Weather.tsx           # OpenWeatherMap microclimate forecast & advisories
│   │   ├── Inventory.tsx         # Stock equipment, fertilizer & reorder alerts
│   │   ├── Workers.tsx           # Labor directory, wage tracking & field assignments
│   │   ├── Finance.tsx           # Operational Income & Expense double-entry ledger
│   │   ├── Harvest.tsx           # Harvest batch logs & quality grading
│   │   ├── AIRecommendations.tsx # AI decision engine for crops & fertilizer
│   │   ├── DiseaseDetection.tsx  # PyTorch Leaf Disease Vision diagnostic UI
│   │   ├── Alerts.tsx            # System notification center (Weather, Soil, Stock)
│   │   └── Reports.tsx           # Summary reporting & CSV export tools
│   │
│   ├── services/                 # API Client Service Layer (Axios Interceptors)
│   │   ├── api.ts                # Axios instance with credentials & Bearer headers
│   │   ├── authService.ts        # Authentication endpoints (`/api/auth/*`)
│   │   ├── farmService.ts        # Farms & Fields REST endpoints (`/api/farms`, `/api/fields`)
│   │   ├── cropService.ts        # Crop cycles REST endpoints (`/api/crops`)
│   │   ├── soilService.ts        # Soil telemetry REST endpoints (`/api/soil`)
│   │   ├── weatherService.ts     # Weather REST endpoints (`/api/weather`)
│   │   ├── inventoryService.ts   # Stock inventory REST endpoints (`/api/inventory`)
│   │   ├── workerService.ts      # Labor REST endpoints (`/api/workers`)
│   │   ├── financeService.ts     # Financial ledger endpoints (`/api/finance/*`)
│   │   ├── harvestService.ts     # Harvest logs endpoints (`/api/harvests`)
│   │   └── predictionService.ts  # ML FastAPI Proxy endpoints (`/api/predictions/*`)
│   │
│   ├── types/                    # Shared TypeScript Type Interfaces
│   │   └── index.ts              # User, Farm, Field, Crop, Soil, Weather interfaces
│   │
│   ├── App.tsx                   # Main layout structure & protected routes
│   └── main.tsx                  # React DOM root entrypoint
│
├── .env                          # Local environment variables
├── package.json                  # Dependencies & script definitions
├── tailwind.config.js            # Tailwind CSS styling configuration
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite bundler & server configuration
```

---

## 🛠️ Technology Stack & Dependencies

| Category | Package / Library | Description |
| :--- | :--- | :--- |
| **Core Framework** | `react` v19, `react-dom` v19 | Single-page UI rendering library |
| **Language & Build** | `typescript` v6, `vite` v8 | Type safety and fast HMR bundling |
| **Routing** | `react-router-dom` v7 | Client-side routing with guarded routes |
| **Styling** | `tailwindcss` v4, `@tailwindcss/postcss` | Utility-first responsive CSS styling |
| **Icons** | `lucide-react` | Clean SVG icon library for modern dashboards |
| **Geospatial GIS** | `@googlemaps/js-api-loader` | Interactive Google Maps, Places Autocomplete & Geocoding |
| **Charts & Data** | `recharts` v3 | Responsive NPK soil chemistry & financial pie/bar charts |
| **HTTP Client** | `axios` v1.19 | HTTP client with automatic JWT header injection and cookie credentials |

---

## 🔑 Key Features & Pages

1. **Authentication & Role Access (`Login.tsx`, `Register.tsx`)**:
   - Secure login & registration supporting roles: `Admin`, `Farm Manager`, and `Worker`.
   - Automatic HTTP-only token cookie handling and `Authorization: Bearer <token>` fallback.

2. **Executive Overview Dashboard (`Dashboard.tsx`)**:
   - High-level metric cards, active field sector counts, satellite weather summary widget, and quick action shortcuts.

3. **Google Maps GIS Field Mapping (`Fields.tsx`)**:
   - Powered by `@googlemaps/js-api-loader` with Google Places autocomplete for any address/city worldwide.
   - Interactive draggable markers, reverse geocoding, GPS locator, custom InfoWindows, and direct MongoDB Atlas CRUD persistence.

4. **Cascading Crop Management (`Crops.tsx`)**:
   - Relational Farm $\rightarrow$ Field dynamic selection dropdowns, planting dates, growth stage tracking, and expected harvest targets.

5. **Soil Telemetry & Composite Scoring (`Soil.tsx`)**:
   - NPK (Nitrogen, Phosphorus, Potassium), pH, and organic matter tracking with Recharts bar visualization and deterministic 0-100 soil health score badges.

6. **Microclimate Live Weather (`Weather.tsx`)**:
   - Integrated with Open-Meteo & OpenWeatherMap APIs to deliver live microclimate telemetry, 7-day weather forecasts, and automated agricultural advisories (irrigation, spraying, fertilizer timing, heat stress).

7. **Financial Ledger & Profit Tracking (`Finance.tsx`)**:
   - Operational Income (crop sales, subsidies) and Expenses (labor, fuel, seeds, machinery) double-entry ledger with net profit calculation and expense pie charts.

8. **AI Leaf Disease Vision & Decision Support (`DiseaseDetection.tsx`, `AIRecommendations.tsx`)**:
   - Computer vision diagnostic upload for plant leaf images connected to Python PyTorch model serving, alongside explainable AI decision support for crop suitability and fertilizer dosage planning.

---

## 🧪 Service & API Integration

All pages interact with the backend API via modular services in `src/services/`. The base `api.ts` module configures Axios with:
- `baseURL`: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`
- `withCredentials`: `true` (enables cross-site HTTP-only authentication cookies)
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` header if a token exists in browser local storage.
