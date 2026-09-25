# 🚜 Integrated Farm Management System - Express.js REST API Backend (`backend`)

![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-green.svg?logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-4.21.2-000000.svg?logo=express)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Mongoose_8.12-47A248.svg?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Stateless_Auth-000000.svg?logo=jsonwebtokens)
![Status](https://img.shields.io/badge/Status-100%25_Operational-brightgreen)

The `backend` directory contains the official RESTful HTTP web server for the **Integrated Farm Management System (PRJ_533)**. Built using **Node.js**, **Express.js**, and **MongoDB Atlas** (via Mongoose ODM), it handles user authentication, Role-Based Access Control (RBAC), GIS field persistence, crop cycle tracking, soil NPK telemetry analysis, live weather advisory calculations, financial accounting, inventory management, labor scheduling, harvest tracking, and proxying requests to the Python FastAPI ML microservice.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB Atlas Connection URI** (or local MongoDB database running on `mongodb://localhost:27017/farm_management`)

### 1. Installation
Navigate into the `backend/` directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Variables Configuration (`.env`)
Create or edit the `.env` file inside the `backend/` directory based on `.env.example`:

```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm_management?retryWrites=true&w=majority

# Authentication Security Secret & Token Expiration
JWT_SECRET=farm_management_super_secret_jwt_key_2026_safe_dev
JWT_EXPIRES_IN=7d

# OpenWeatherMap API Key (Used for live microclimate forecasts & advisories)
WEATHER_API_KEY=your_openweather_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Python FastAPI Machine Learning Microservice URL
ML_SERVICE_URL=http://localhost:8000

# Client Application URL for CORS Configuration
CLIENT_URL=http://localhost:5173
```

### 3. Launch Server in Development Mode
Run the Express server with native Node `--watch` auto-reloading:

```bash
npm run dev
```

Expected Terminal Output:
```text
[Database] MongoDB Connected: ac-zgl8wai-shard-00-01.n7zxp5q.mongodb.net
[Server] Express server running in development mode on port 5000
```

- **Health Check Endpoint**: Test the backend is live at **`http://localhost:5000/api/health`**

### 4. Run in Production Mode
```bash
npm start
```

---

## 📁 Directory & Module Layout

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas Mongoose connection & error handler
│   │
│   ├── models/                   # 10 Mongoose Database Schemas
│   │   ├── User.js               # Credentials, bcrypt hashing pre-save hook, RBAC roles
│   │   ├── Farm.js               # Top-level farm entity records & user ownership
│   │   ├── Field.js              # Field plot GIS boundary coordinates & soil metadata
│   │   ├── Crop.js               # Active and historical crop cycles & growth stages
│   │   ├── SoilRecord.js         # NPK chemistry logs & sampling dates
│   │   ├── Inventory.js          # Farm equipment, seed stock & reorder thresholds
│   │   ├── Worker.js             # Labor directory, daily wages & assigned fields
│   │   ├── Income.js             # Crop sales & operational revenue records
│   │   ├── Expense.js            # Input costs (seeds, labor, fuel, chemicals)
│   │   └── Harvest.js            # Harvest batch outputs & quality grading
│   │
│   ├── controllers/              # Business Logic Route Handlers
│   │   ├── authController.js     # User registration, login, logout, profile checks
│   │   ├── userController.js     # User profile retrieval & update handlers
│   │   ├── farmController.js     # Farm CRUD operations
│   │   ├── fieldController.js    # GIS Field Sector CRUD operations
│   │   ├── cropController.js     # Crop cycle CRUD with farm ownership validation
│   │   ├── soilController.js     # Soil telemetry CRUD & health calculator integration
│   │   ├── weatherController.js  # OpenWeatherMap fetcher & advisory rule engine
│   │   ├── inventoryController.js# Inventory item CRUD & low-stock alerts
│   │   ├── workerController.js   # Worker assignment & wage tracking
│   │   ├── financeController.js  # Income, Expense CRUD & net profit calculation
│   │   ├── harvestController.js  # Yield harvest CRUD operations
│   │   └── predictionController.js # Proxy endpoints to Python FastAPI ML service
│   │
│   ├── routes/                   # Express Endpoint Router Modules
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   ├── farmRoutes.js         # /api/farms routes
│   │   ├── fieldRoutes.js        # /api/fields & /api/field-sectors routes
│   │   ├── cropRoutes.js         # /api/crops routes
│   │   ├── soilRoutes.js         # /api/soil routes
│   │   ├── weatherRoutes.js      # /api/weather routes
│   │   ├── inventoryRoutes.js    # /api/inventory routes
│   │   ├── workerRoutes.js       # /api/workers routes
│   │   ├── financeRoutes.js      # /api/finance routes
│   │   ├── harvestRoutes.js      # /api/harvests routes
│   │   └── predictionRoutes.js   # /api/predictions routes
│   │
│   ├── middleware/               # Security & Error Middleware
│   │   ├── authMiddleware.js     # JWT HTTP-only cookie & Bearer token validator
│   │   ├── roleMiddleware.js     # Role-Based Access Control (Admin, Manager, Worker)
│   │   └── errorMiddleware.js    # Centralized error formatter & secret sanitization
│   │
│   ├── services/                 # External Integrations & Services
│   │   ├── authService.js        # Auth authentication logic
│   │   └── weatherService.js     # OpenWeatherMap REST API caller
│   │
│   ├── utils/                    # Helper Utilities
│   │   ├── jwt.js                # JWT signing & verification methods
│   │   ├── soilHealthCalculator.js # Deterministic composite 0-100 soil health score
│   │   └── agriculturalWeatherEngine.js # Irrigation/spray advisory rule engine
│   │
│   └── server.js                 # Express server entry point, CORS & routes mounting
│
├── .env                          # Environment secrets configuration
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies & scripts
└── README.md                     # Backend documentation
```

---

## 📡 REST API Endpoints Specification

All endpoints under `/api/*` return standard JSON responses: `{ success: true, message: "...", data: ... }`.

### 1. Authentication & Users (`/api/auth`, `/api/users`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user, hash password with `bcryptjs`, issue JWT token cookie |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return HTTP-only JWT token cookie |
| `POST` | `/api/auth/logout` | Protected | Clear `token` cookie and end user session |
| `GET` | `/api/auth/me` | Protected | Get currently logged-in user details |
| `GET` | `/api/users/profile` | Protected | Retrieve safe user profile metadata |

### 2. Farms & Fields GIS (`/api/farms`, `/api/fields`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/farms` | Protected | Retrieve all farms belonging to logged-in user |
| `POST` | `/api/farms` | Protected | Create a new farm record |
| `PUT` | `/api/farms/:id` | Protected | Update existing farm details |
| `DELETE` | `/api/farms/:id` | Protected | Delete farm record and associated sub-entities |
| `GET` | `/api/fields` | Protected | Retrieve all field sectors with Google Maps coordinates |
| `POST` | `/api/fields` | Protected | Create a new field plot with lat/lng coordinates and soil type |
| `PUT` | `/api/fields/:id` | Protected | Update field plot boundaries and metadata |
| `DELETE` | `/api/fields/:id` | Protected | Remove field plot from database |

### 3. Crop Cycles (`/api/crops`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/crops` | Protected | Fetch crop cycles filtered by farm or field |
| `POST` | `/api/crops` | Protected | Log a new planted crop cycle with sowing and harvest dates |
| `PUT` | `/api/crops/:id` | Protected | Update growth stage status (Planted, Growing, Harvested) |
| `DELETE` | `/api/crops/:id` | Protected | Delete crop cycle record |

### 4. Soil Telemetry (`/api/soil`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/soil` | Protected | Retrieve field soil logs (NPK, pH, moisture) |
| `POST` | `/api/soil` | Protected | Create soil chemistry entry (calculates 0-100 composite health score) |
| `DELETE` | `/api/soil/:id` | Protected | Remove soil sample log |

### 5. Weather Telemetry & Advisories (`/api/weather`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/weather/:farmId` | Protected | Fetch OpenWeatherMap microclimate forecast & calculated advisories |

### 6. Inventory & Stock (`/api/inventory`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory` | Protected | List stock items with low-quantity warning indicators |
| `POST` | `/api/inventory` | Protected | Add new seed, fertilizer, chemical, or equipment item |
| `PUT` | `/api/inventory/:id` | Protected | Update item stock quantity or unit cost |
| `DELETE` | `/api/inventory/:id` | Protected | Remove inventory item |

### 7. Labor & Workers (`/api/workers`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workers` | Protected | Directory of farm labor personnel and assigned fields |
| `POST` | `/api/workers` | Protected | Register worker with daily wage rate and field binding |
| `PUT` | `/api/workers/:id` | Protected | Update worker role or assignment |
| `DELETE` | `/api/workers/:id` | Protected | Remove worker record |

### 8. Financial Ledger (`/api/finance`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/income` | Protected | List revenue income entries |
| `POST` | `/api/finance/income` | Protected | Record new crop sale or financial grant |
| `GET` | `/api/finance/expense` | Protected | List operational cost entries |
| `POST` | `/api/finance/expense` | Protected | Record fuel, labor, chemical, or seed expenditure |
| `GET` | `/api/finance/summary` | Protected | Compute total income, total expenses, and net profit per farm |

### 9. Harvest Management (`/api/harvests`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/harvests` | Protected | Retrieve logged yield harvests |
| `POST` | `/api/harvests` | Protected | Record completed harvest yield (kg/tons) and quality grade |

### 10. AI Predictions Proxy (`/api/predictions`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/predictions/crop` | Protected | Proxy POST request to Python ML FastAPI for crop suitability |
| `POST` | `/api/predictions/yield` | Protected | Proxy POST request to Python ML FastAPI for yield estimation |
| `POST` | `/api/predictions/disease` | Protected | Forward leaf image payload to PyTorch leaf disease CV service |

---

## 🔐 Security Architecture

- **Password Protection**: Plaintext passwords are automatically hashed with `bcryptjs` (salt factor 10) in a Mongoose `pre('save')` hook. Passwords are set to `select: false` to prevent accidental inclusion in query responses.
- **Stateless JWT Cookies**: Authentication tokens are stored inside HTTP-Only, SameSite cookies to protect against Cross-Site Scripting (XSS).
- **Role-Based Access Control**: `roleMiddleware.js` verifies permissions (`Admin`, `Farm Manager`, `Worker`) before granting access to sensitive routes.
- **Secret Sanitization**: Centralized error middleware ensures stack traces and internal environment secrets are sanitized in production.
