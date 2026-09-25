# 🚜 Integrated Farm Management System - Backend Integration & Operational Architecture Reference

This reference document provides a complete technical map of how the React + TypeScript frontend pages, Node.js + Express REST API backend, MongoDB Atlas database, and Python FastAPI ML microservice communicate in real-time.

---

## 📑 Table of Contents
1. [Overview & Architecture](#-overview--architecture)
2. [End-to-End Integration Matrix](#-end-to-end-integration-matrix)
3. [Module-by-Module Integration Architecture](#-module-by-module-integration-architecture)
   - [Phase 1: Authentication & User Sessions](#phase-1-authentication--user-sessions)
   - [Phase 2: Farms, Fields & Google Maps GIS](#phase-2-farms-fields--google-maps-gis)
   - [Phase 3: Crop Cycle Management](#phase-3-crop-cycle-management)
   - [Phase 4: Soil Chemistry Telemetry](#phase-4-soil-chemistry-telemetry)
   - [Phase 5: OpenWeatherMap Weather Microclimate & Advisories](#phase-5-openopenweathermap-weather-microclimate--advisories)
   - [Phase 6: Financial Ledger & Profitability](#phase-6-financial-ledger--profitability)
   - [Phase 7: Inventory & Stock Management](#phase-7-inventory--stock-management)
   - [Phase 8: Workers & Task Allocation](#phase-8-workers--task-allocation)
   - [Phase 9: Harvest Logging & Quality Grading](#phase-9-harvest-logging--quality-grading)
   - [Phase 10: AI Crop Recommendations & PyTorch Leaf Disease Vision](#phase-10-ai-crop-recommendations--pytorch-leaf-disease-vision)
4. [How to Run the Integrated System](#-how-to-run-the-integrated-system)

---

## 🏗️ Overview & Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Axios + Google Maps JS API + Recharts
- **Backend**: Node.js + Express.js + Mongoose + MongoDB Atlas + JWT + bcryptjs + cookie-parser
- **ML Microservice**: Python 3.10+ + FastAPI + Uvicorn + PyTorch + Torchvision + Pydantic

### Data Flow Pattern
```text
[ React Frontend Page ] ──> [ Service (e.g. farmService.ts) ] ──> [ Axios (api.ts) ]
                                                                        │
                                                              HTTP / REST with JWT Header/Cookie
                                                                        ▼
[ Express Router ] ──> [ Controller Logic ] ──> [ MongoDB Atlas Mongoose Model ]
        │
        └──────> [ FastAPI ML Proxy / Weather API ] ──> [ Synthesized Directives ]
```

---

## 📊 End-to-End Integration Matrix

| Module | Frontend File | Service File | Backend Route | Backend Controller | Database Model | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Auth** | `Login.tsx`, `Register.tsx` | `authService.ts` | `/api/auth/*` | `authController.js` | `User.js` | ✅ Connected |
| **User Profile**| Profile View | `authService.ts` | `/api/users/profile` | `userController.js` | `User.js` | ✅ Connected |
| **Farms** | `Farms.tsx` | `farmService.ts` | `/api/farms` | `farmController.js` | `Farm.js` | ✅ Connected |
| **Fields / GIS**| `Fields.tsx` | `farmService.ts` | `/api/fields` | `fieldController.js` | `Field.js` | ✅ Connected |
| **Crops** | `Crops.tsx` | `cropService.ts` | `/api/crops` | `cropController.js` | `Crop.js` | ✅ Connected |
| **Soil Telemetry**| `Soil.tsx` | `soilService.ts` | `/api/soil` | `soilController.js` | `SoilRecord.js` | ✅ Connected |
| **Weather** | `Weather.tsx` | `weatherService.ts` | `/api/weather` | `weatherController.js` | OpenWeather API | ✅ Connected |
| **Inventory** | `Inventory.tsx` | `inventoryService.ts` | `/api/inventory` | `inventoryController.js` | `Inventory.js` | ✅ Connected |
| **Workers** | `Workers.tsx` | `workerService.ts` | `/api/workers` | `workerController.js` | `Worker.js` | ✅ Connected |
| **Finance** | `Finance.tsx` | `financeService.ts` | `/api/finance/*` | `financeController.js` | `Income.js`, `Expense.js` | ✅ Connected |
| **Harvest** | `Harvest.tsx` | `harvestService.ts` | `/api/harvests` | `harvestController.js` | `Harvest.js` | ✅ Connected |
| **AI Predictions**| `AIRecommendations.tsx`, `DiseaseDetection.tsx` | `predictionService.ts` | `/api/predictions/*` | `predictionController.js` | FastAPI / PyTorch | ✅ Connected |

---

## 🛠️ Module-by-Module Integration Architecture

### Phase 1: Authentication & User Sessions
- **Endpoints**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/users/profile`.
- **Flow**: User inputs credentials $\rightarrow$ Express validates and compares hash via `bcryptjs` $\rightarrow$ Signs JWT payload with `userId` and `role` $\rightarrow$ Sets HTTP-only cookie + returns Bearer token header $\rightarrow$ React `AuthContext` restores active session on page reload.

### Phase 2: Farms, Fields & Google Maps GIS
- **Endpoints**: `/api/farms`, `/api/fields`.
- **Flow**: `Fields.tsx` renders `@googlemaps/js-api-loader` $\rightarrow$ User searches city via Google Places Autocomplete or drags marker $\rightarrow$ Geocodes address to Lat/Lng coordinates $\rightarrow$ Saves field boundaries to MongoDB Atlas `fields` collection.

### Phase 3: Crop Cycle Management
- **Endpoints**: `/api/crops`.
- **Flow**: `Crops.tsx` populates cascading Farm $\rightarrow$ Field dropdowns $\rightarrow$ User creates crop cycle $\rightarrow$ Backend enforces relational validation (`User` owns `Farm` and `Farm` owns `Field`).

### Phase 4: Soil Chemistry Telemetry
- **Endpoints**: `/api/soil`.
- **Flow**: User logs NPK, pH, and moisture parameters $\rightarrow$ Backend executes `soilHealthCalculator.js` computing deterministic 0-100 score $\rightarrow$ React renders trend lines on Recharts bar graphs.

### Phase 5: OpenWeatherMap Weather Microclimate & Advisories
- **Endpoints**: `/api/weather/:farmId`.
- **Flow**: Backend queries farm coordinates $\rightarrow$ Fetches OpenWeatherMap / Open-Meteo REST API $\rightarrow$ Executes `agriculturalWeatherEngine.js` evaluating rules (e.g., Delay Irrigation if precipitation $>20\text{mm}$) $\rightarrow$ Frontend displays 7-day forecast & advisory badges.

### Phase 6: Financial Ledger & Profitability
- **Endpoints**: `/api/finance/income`, `/api/finance/expense`, `/api/finance/summary`.
- **Flow**: Logs revenues and operational expenditures $\rightarrow$ Backend calculates net profit (`Total Income - Total Expenses`) per farm $\rightarrow$ Recharts pie charts visualize spending breakdown.

### Phase 7: Inventory & Stock Management
- **Endpoints**: `/api/inventory`.
- **Flow**: Tracks stocks of seeds, fertilizers, pesticides, and tools $\rightarrow$ Highlights low-stock badges when `quantity <= minThreshold`.

### Phase 8: Workers & Task Allocation
- **Endpoints**: `/api/workers`.
- **Flow**: Directory of farm workers linked to field sectors with daily wage rates and active shift statuses.

### Phase 9: Harvest Logging & Quality Grading
- **Endpoints**: `/api/harvests`.
- **Flow**: Logs yield output volume (kg/tons) and quality grades (Grade A/B/C) linked to specific crop cycles.

### Phase 10: AI Crop Recommendations & PyTorch Leaf Disease Vision
- **Endpoints**: `/api/predictions/crop`, `/api/predictions/disease`.
- **Flow**: Leaf image uploaded via `DiseaseDetection.tsx` $\rightarrow$ Express proxies image payload to Python FastAPI ML microservice on port 8000 $\rightarrow$ PyTorch CNN executes inference against `best_tomato_disease_model.pth` $\rightarrow$ Returns diagnosis, confidence score, and treatment plan.

---

## 🚀 How to Run the Integrated System

Launch all services concurrently in separate terminal instances:

```bash
# Terminal 1 - Express REST API Backend
cd backend
npm run dev

# Terminal 2 - Python FastAPI ML Microservice
cd ml-service
python run.py

# Terminal 3 - React 19 Frontend Client
cd frontend
npm run dev
```

Access the client application at **`http://localhost:5173`**.
