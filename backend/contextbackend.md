# Integrated Farm Management System - Backend Architecture & Context Log

**Document Name**: `contextbackend.md`  
**Location**: `backend/contextbackend.md`  
**Last Updated**: 2026-09-23  

---

## 1. Executive Overview

This document provides a comprehensive technical reference for the backend structure built for the **Integrated Farm Management System (PRJ_533)**.

The backend is engineered as an isolated Node.js / Express.js REST API service connected to MongoDB Atlas via Mongoose ODM, providing secure authentication, role authorization, database persistence, weather advisory logic, and proxying to the Python FastAPI ML microservice.

---

## 2. Completed Milestones History

### Milestone 1: Backend Authentication & Authorization Foundation (2026-08-21)
- **Directory Isolation**: Created an isolated `backend/` root directory.
- **Dependencies**: Installed `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, and `dotenv`.
- **Database Connection**: Built `src/config/db.js` connecting to MongoDB Atlas cluster (`ac-zgl8wai-shard-00-01.n7zxp5q.mongodb.net`).
- **User Schema**: Built `src/models/User.js` supporting lowercase unique emails, `bcryptjs` password hashing pre-save hook, role-based access (`Admin`, `Farm Manager`, `Worker`), `isActive` status flag, timestamps, and safe object serialization.
- **JWT System**: Built `src/utils/jwt.js` for token signing and verification using env variables (`JWT_SECRET`, `JWT_EXPIRES_IN`).
- **Services & Controllers**: Built `src/services/authService.js` and `src/controllers/authController.js` for `/register`, `/login`, `/logout`, and `/me`.
- **Middleware Security**: Built `src/middleware/authMiddleware.js` (HTTP-only cookie & Bearer token parsing), `src/middleware/roleMiddleware.js` (Role-Based Access Control), and `src/middleware/errorMiddleware.js` (sanitized global error handler).

### Milestone 2: User Profiles & CORS Alignment (2026-08-21)
- **User Profile Route**: Added `src/routes/userRoutes.js` and mounted `GET /api/users/profile` protected by `authMiddleware`.
- **CORS Alignment**: Configured `server.js` to support cross-domain requests from Vite client servers (`http://localhost:5173`, `http://localhost:3000`) with `credentials: true`.

### Milestone 3: Google Maps GIS Integration & MongoDB Field Persistence (2026-08-21)
- **Field Model**: Created `src/models/Field.js` with user relationship, coordinates (`latitude`, `longitude`), area, soil type, and status.
- **Field Controllers & Routes**: Created `src/controllers/fieldController.js` and `src/routes/fieldRoutes.js` mounted at `/api/fields` and `/api/field-sectors`.

### Milestone 4: Complete Resource REST APIs Implementation (2026-08-25)
- **Farms & Crops**: Built `Farm.js` and `Crop.js` Mongoose models, controllers, and routes with relational ownership validation.
- **Soil Telemetry**: Built `SoilRecord.js` and `soilHealthCalculator.js` utility calculating a deterministic composite 0-100 soil health score.
- **Weather Service**: Built `weatherService.js` calling OpenWeatherMap & Open-Meteo REST APIs and `agriculturalWeatherEngine.js` for rule-based agricultural advisories.
- **Inventory & Workers**: Built `Inventory.js` and `Worker.js` models, controllers, and routes with low-stock thresholding and field assignment.
- **Financial Ledger & Harvests**: Built `Income.js`, `Expense.js`, and `Harvest.js` models, controllers, and routes calculating net profit summary statistics.
- **AI Prediction Proxy**: Built `predictionController.js` and `predictionRoutes.js` forwarding inference requests to Python FastAPI ML service on port 8000.

---

## 3. Directory Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection setup
│   ├── controllers/              # 12 Entity REST Controllers
│   │   ├── authController.js     # Register, login, logout, getMe handlers
│   │   ├── userController.js     # User profile retrieval & management
│   │   ├── farmController.js     # Farm CRUD handlers
│   │   ├── fieldController.js    # Field plot GIS CRUD handlers
│   │   ├── cropController.js     # Crop cycle CRUD handlers
│   │   ├── soilController.js     # Soil telemetry CRUD handlers
│   │   ├── weatherController.js  # Weather fetcher & advisory engine
│   │   ├── inventoryController.js# Inventory CRUD handlers
│   │   ├── workerController.js   # Labor directory CRUD handlers
│   │   ├── financeController.js  # Income, Expense & Profit summary handlers
│   │   ├── harvestController.js  # Harvest batch output CRUD handlers
│   │   └── predictionController.js # ML FastAPI proxy handler
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & req.user protection
│   │   ├── roleMiddleware.js     # Role-Based Access Control (RBAC)
│   │   └── errorMiddleware.js    # Global error response & secret sanitization
│   ├── models/                   # 10 Mongoose Schemas
│   │   ├── User.js               # Mongoose User schema
│   │   ├── Farm.js               # Mongoose Farm schema
│   │   ├── Field.js              # Mongoose Field Plot schema
│   │   ├── Crop.js               # Mongoose Crop Cycle schema
│   │   ├── SoilRecord.js         # Mongoose Soil Telemetry schema
│   │   ├── Inventory.js          # Mongoose Inventory schema
│   │   ├── Worker.js             # Mongoose Worker schema
│   │   ├── Income.js             # Mongoose Income Transaction schema
│   │   ├── Expense.js            # Mongoose Expense Transaction schema
│   │   └── Harvest.js            # Mongoose Harvest Log schema
│   ├── routes/                   # 12 Express Router Definitions
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── userRoutes.js         # /api/users endpoints
│   │   ├── farmRoutes.js         # /api/farms endpoints
│   │   ├── fieldRoutes.js        # /api/fields & /api/field-sectors endpoints
│   │   ├── cropRoutes.js         # /api/crops endpoints
│   │   ├── soilRoutes.js         # /api/soil endpoints
│   │   ├── weatherRoutes.js      # /api/weather endpoints
│   │   ├── inventoryRoutes.js    # /api/inventory endpoints
│   │   ├── workerRoutes.js       # /api/workers endpoints
│   │   ├── financeRoutes.js      # /api/finance endpoints
│   │   ├── harvestRoutes.js      # /api/harvests endpoints
│   │   └── predictionRoutes.js   # /api/predictions endpoints
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   └── weatherService.js     # OpenWeatherMap API HTTP client
│   ├── utils/
│   │   ├── jwt.js                # JWT signing & verification helpers
│   │   ├── soilHealthCalculator.js # Composite 0-100 soil health calculator
│   │   └── agriculturalWeatherEngine.js # Weather advisory decision rules
│   └── server.js                 # Express app initialization, CORS, middleware, listener
├── .env                          # Local environment variables
├── .env.example                  # Reference environment template
├── contextbackend.md             # Backend architecture context log (this file)
├── package.json                  # Node dependencies and execution scripts
└── README.md                     # Backend documentation and API reference
```

---

## 4. API Endpoints Reference Matrix

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Validates input, hashes password, creates user, sets HTTP-only JWT cookie |
| `POST` | `/api/auth/login` | Public | Validates credentials, checks `isActive`, sets HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Protected | Clears `token` HTTP-only cookie |
| `GET` | `/api/users/profile` | Protected | Returns authenticated user safe profile |
| `GET` | `/api/farms` | Protected | Lists farms belonging to authenticated user |
| `GET` | `/api/fields` | Protected | Returns field plots with GIS coordinates |
| `GET` | `/api/crops` | Protected | Lists crop cycles filtered by farm or field |
| `GET` | `/api/soil` | Protected | Returns soil telemetry logs and composite health scores |
| `GET` | `/api/weather/:farmId` | Protected | Returns live OpenWeatherMap forecast and advisories |
| `GET` | `/api/inventory` | Protected | Lists inventory stock items with reorder threshold warnings |
| `GET` | `/api/workers` | Protected | Lists labor directory and field assignments |
| `GET` | `/api/finance/summary` | Protected | Computes total income, total expense, and net profit |
| `GET` | `/api/harvests` | Protected | Returns yield harvest logs and quality grades |
| `POST` | `/api/predictions/crop` | Protected | Proxy POST request to Python FastAPI ML microservice |
| `POST` | `/api/predictions/disease` | Protected | Proxy leaf image file upload to PyTorch vision microservice |
