# PRJ_533 – Integrated Farm Resource Planning and Agricultural Decision Support System

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-green.svg?logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-4.21.2-000000.svg?logo=express)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Mongoose_8.12-47A248.svg?logo=mongodb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C.svg?logo=pytorch)
![Status](https://img.shields.io/badge/Status-100%25_Operational-brightgreen)

An enterprise-grade, multi-tier agricultural resource management and decision-support platform engineered to centralize farm operations, optimize resource utilization (water, fertilizer, equipment, labor, capital), and deliver data-driven predictive insights for modern farming.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [How to Run the Application](#how-to-run-the-application)
- [Main Functional Modules](#main-functional-modules)
- [AI/ML Capabilities](#aiml-capabilities)
- [Project Directory Structure](#project-directory-structure)
- [Database Schema & Collections](#database-schema--collections)
- [REST API Specification](#rest-api-specification)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Security Architecture](#security-architecture)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## 🌾 Project Overview

**PRJ_533** is a full-stack integrated software platform built to modernize agricultural management. It bridges the gap between raw agricultural telemetry and day-to-day farm operations by unifying farm administration, GIS field plot mapping (Google Maps API), environmental microclimate weather tracking (Open-Meteo & OpenWeatherMap), financial double-entry accounting, worker scheduling, and machine learning decision support into a single control panel.

The platform relies on open agricultural datasets, curated soil/crop chemistry records, image-based plant disease pathology models (PyTorch), and live weather APIs to empower farmers, farm managers, and agricultural advisors with evidence-based operational directives.

---

## 🏗️ System Architecture

The application is engineered as a decoupled, 3-tier microservices architecture:

```mermaid
flowchart TB
    subgraph ClientLayer [Client Tier]
        User([Farmer / Farm Manager]) <--> Frontend[React 19 + TypeScript + Vite Frontend\nhttp://localhost:5173]
    end

    subgraph ExternalServices [External Integrations]
        OpenWeather[OpenWeatherMap & Open-Meteo Weather APIs]
        GoogleMaps[Google Maps JS & Places Autocomplete API]
    end

    subgraph ApplicationLayer [Backend Tier]
        Frontend <--> ExpressAPI[Node.js / Express REST API Server\nhttp://localhost:5000]
        ExpressAPI <--> SoilCalc[Soil Health Calculator Engine]
        ExpressAPI <--> WeatherEngine[Agricultural Weather Decision Engine]
    end

    subgraph IntelligenceLayer [AI/ML Microservice Tier]
        ExpressAPI <--> FastAPIService[Python FastAPI ML Microservice\nhttp://localhost:8000]
        FastAPIService <--> PyTorchCV[PyTorch Leaf Disease Vision Engine]
        FastAPIService <--> AgronomicModels[Agronomic Decision Predictor]
    end

    subgraph DataLayer [Database Tier]
        ExpressAPI <--> Database[(MongoDB Atlas Database Cluster)]
    end

    %% External Connections
    OpenWeather --> ExpressAPI
    GoogleMaps --> Frontend

    %% Output Directives
    ExpressAPI -->|Actionable Directives| Frontend
```

---

## 🛠️ Technology Stack

| Tier | Component | Technology & Libraries |
| :--- | :--- | :--- |
| **Frontend** | Single-Page Client Application | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Recharts, `@googlemaps/js-api-loader` |
| **Backend** | REST API Web Server | Node.js v18+, Express.js v4.21, Mongoose ODM v8.12, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `cookie-parser` |
| **Database** | Managed NoSQL Document Store | MongoDB Atlas Cloud Cluster |
| **ML Microservice** | AI Inference Engine | Python 3.10+, FastAPI v0.100+, Uvicorn, PyTorch v2.0+, Torchvision, Pillow, Pydantic v2 |
| **External APIs** | Weather & GIS Services | OpenWeatherMap API, Open-Meteo REST API, Google Maps JavaScript API, Google Places Autocomplete |

---

## 🚀 How to Run the Application

To run the entire system locally, launch the **Backend REST API**, **ML Microservice**, and **Frontend Client** in separate terminal windows.

### Service Ports Quick Summary

| Microservice | Location | Start Command | URL / Endpoint |
| :--- | :--- | :--- | :--- |
| **Backend REST API** | `./backend` | `npm run dev` | **`http://localhost:5000`** (`/api/health`) |
| **ML Microservice** | `./ml-service` | `python run.py` | **`http://localhost:8000`** (`/docs` for Swagger UI) |
| **Frontend Client** | `./frontend` | `npm run dev` | **`http://localhost:5173`** |

---

### Step-by-Step Launch Guide

#### 1. Launch Backend REST API (Terminal 1)
```bash
# Navigate into backend directory
cd backend

# Install Node dependencies
npm install

# Start Express server with auto-reloading
npm run dev
```
*The Express REST API server will run on `http://localhost:5000` and connect to MongoDB Atlas.*

---

#### 2. Launch Machine Learning Microservice (Terminal 2)
```bash
# Navigate into ml-service directory from project root
cd ml-service

# Create and activate Python virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server
python run.py
```
*The FastAPI server will run on `http://localhost:8000`. Access Swagger UI docs at `http://localhost:8000/docs`.*

---

#### 3. Launch Frontend Client (Terminal 3)
```bash
# Navigate into frontend directory from project root
cd frontend

# Install frontend dependencies
npm install

# Start Vite client dev server
npm run dev
```
*The React client application will start on `http://localhost:5173`.*

---

## 🔑 Main Functional Modules

| Module | Location | Description |
| :--- | :--- | :--- |
| **Authentication & RBAC** | `Login.tsx`, `Register.tsx` | User registration, login, HTTP-only JWT cookies, and role access (`Admin`, `Farm Manager`, `Worker`). |
| **Executive Dashboard** | `Dashboard.tsx` | Operational summary overview cards, active sector stats, and live satellite weather widget. |
| **Farm Management** | `Farms.tsx` | Manage high-level farm entity records, geolocation, ownership, and acreage. |
| **Field Sector GIS Mapping** | `Fields.tsx` | Interactive Google Maps JS API with Google Places autocomplete, draggable markers, reverse geocoding, and field plot boundaries. |
| **Crop Cycle Tracker** | `Crops.tsx` | Crop tracking with dynamic Farm $\rightarrow$ Field cascaded dropdowns, planting dates, growth stages, and harvest targets. |
| **Soil Telemetry & Health** | `Soil.tsx` | NPK chemistry logs (Nitrogen, Phosphorus, Potassium, pH), Recharts bar charts, and deterministic composite 0-100 soil health score badges. |
| **Microclimate Live Weather** | `Weather.tsx` | Live microclimate weather telemetry powered by Open-Meteo & OpenWeatherMap APIs with automated irrigation, spraying, and fertilizer advisories. |
| **Stock Inventory** | `Inventory.tsx` | Stock tracker for seeds, fertilizer, pesticides, and equipment with low-stock reorder warnings. |
| **Worker & Labor Scheduling** | `Workers.tsx` | Directory of farm labor personnel, assigned field sectors, daily wages, and shift statuses. |
| **Financial Ledger** | `Finance.tsx` | Income (crop sales, grants) and Expenses (labor, fuel, seeds) double-entry ledger with net profit calculation and expense pie charts. |
| **Harvest Logging** | `Harvest.tsx` | Batch harvest output tracking (kg/tons), storage locations, and quality grading (Grade A/B/C). |
| **AI Leaf Disease Vision** | `DiseaseDetection.tsx` | PyTorch computer vision leaf image upload interface diagnosing crop diseases with severity scores and treatment protocols. |
| **AI Decision Engine** | `AIRecommendations.tsx` | Explainable decision support engine generating crop suitability and fertilizer deficit recommendations. |
| **Alert Notification Center** | `Alerts.tsx` | Actionable system notifications for upcoming tasks, weather warnings, and low inventory. |
| **Reports & CSV Export** | `Reports.tsx` | Exportable summary reports for farm operations, yield trends, and financial performance. |

---

## 🤖 AI/ML Capabilities

1. **Computer Vision Leaf Disease Diagnosis (`/predict/disease`)**:
   - PyTorch CNN model with auto-architecture state dict detection (ResNet/MobileNet/EfficientNet).
   - Identifies plant pathology from leaf images, providing disease name, confidence score, and remediation advice.

2. **Crop Suitability Recommendation (`/predict/crop`)**:
   - Evaluates soil NPK parameters, soil pH, ambient temperature, humidity, and annual rainfall to recommend optimal crops.

3. **Harvest Yield Performance Forecaster (`/predict/yield`)**:
   - Estimates harvest tonnage per hectare based on historical yield baselines, field area, and soil parameters.

4. **Fertilizer Deficit & Dosage Planner (`/predict/fertilizer`)**:
   - Calculates soil NPK deficits against crop requirements and outputs targeted fertilizer dosage plans (Urea, DAP, NPK).

---

## 📁 Project Directory Structure

```text
PRJ_533-Farm-Management/
├── frontend/                     # React 19 + TypeScript + Vite Frontend Client
│   ├── src/
│   │   ├── components/           # Reusable UI component library (GoogleFieldMap, StatCard, etc.)
│   │   ├── context/              # React state context providers (AuthContext, ToastContext)
│   │   ├── pages/                # 16 Complete Application Page Views
│   │   ├── services/             # API service layer (api.ts, farmService, soilService, etc.)
│   │   ├── types/                # Shared TypeScript type definitions
│   │   ├── App.tsx               # Root component and router configuration
│   │   └── main.tsx              # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/               # MongoDB Atlas connection (db.js)
│   │   ├── controllers/          # 12 Entity REST API Route Handlers
│   │   ├── middleware/           # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── models/               # 10 Mongoose Schemas (User, Farm, Field, Crop, Soil, etc.)
│   │   ├── routes/               # Express endpoint router definitions
│   │   ├── services/             # External integration services (Weather, ML proxy)
│   │   ├── utils/                # JWT helpers, soil calculator & weather decision engine
│   │   └── server.js             # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── ml-service/                   # Python FastAPI Machine Learning Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI server endpoints
│   │   ├── disease_model.py      # PyTorch deep learning vision model loader
│   │   ├── predictor.py          # Agronomic decision recommendation engine
│   │   ├── schemas.py            # Pydantic data schemas
│   │   └── utils.py              # Image preprocessing utilities
│   ├── models/                   # Active PyTorch model weights (best_tomato_disease_model.pth)
│   ├── tests/                    # PyTest automated test suite
│   ├── requirements.txt
│   └── run.py                    # Uvicorn ASGI server launcher
│
├── docs/                         # Specifications & technical documentation
├── PROJECT_PROGRESS_AND_EXPLANATION.md # Progress log & technical detailed architecture
├── BACKEND_INTEGRATION_ROADMAP.md      # Integration reference guide
├── CONTRIBUTING.md               # Contribution guidelines & developer standards
└── README.md                     # Main Project README
```

---

## 🗄️ Database Schema & Collections

The backend uses MongoDB Atlas with Mongoose ODM. Key collections include:

| Collection | Model File | Primary Attributes |
| :--- | :--- | :--- |
| `users` | `User.js` | `_id`, `name`, `email`, `password` (hashed), `role`, `isActive`, `createdAt` |
| `farms` | `Farm.js` | `_id`, `user`, `name`, `location`, `totalArea`, `soilType`, `createdAt` |
| `fields` | `Field.js` | `_id`, `user`, `farm`, `name`, `area`, `latitude`, `longitude`, `soilType`, `status` |
| `crops` | `Crop.js` | `_id`, `user`, `farm`, `field`, `name`, `variety`, `plantingDate`, `expectedHarvestDate`, `status` |
| `soil_records`| `SoilRecord.js` | `_id`, `user`, `field`, `nitrogen`, `phosphorus`, `potassium`, `ph`, `moisture`, `organicMatter` |
| `inventory` | `Inventory.js` | `_id`, `user`, `farm`, `name`, `category`, `quantity`, `unit`, `minThreshold`, `costPerUnit` |
| `workers` | `Worker.js` | `_id`, `user`, `farm`, `name`, `role`, `phone`, `dailyWage`, `assignedField` |
| `incomes` | `Income.js` | `_id`, `user`, `farm`, `category`, `amount`, `source`, `date` |
| `expenses` | `Expense.js` | `_id`, `user`, `farm`, `category`, `amount`, `description`, `date` |
| `harvests` | `Harvest.js` | `_id`, `user`, `farm`, `crop`, `field`, `harvestDate`, `yieldQuantity`, `unit`, `qualityGrade` |

---

## 🔐 Environment Variables Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm_management?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
WEATHER_API_KEY=your_openweather_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## 🤝 Contribution Guidelines

Contributions are welcome! Please refer to [`CONTRIBUTING.md`](CONTRIBUTING.md) for full details regarding developer setup, Git branch conventions (`feature/`, `bugfix/`), Conventional Commits standards, and pull request workflows.

---

## 📄 License

This project is licensed under the ISC License.
