# PRJ_533 Backend API Specification & Database Contract

This document provides the single-source technical specification for the Node.js / Express.js REST API server and MongoDB database required to serve the PRJ_533 Integrated Farm Resource Planning Frontend Application.

---

## 1. Global Server & Environment Requirements

### Environment Variables (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farm_management
JWT_SECRET=your_jwt_secret_key_here
FASTAPI_ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
```

### Global Middleware Stack
1. **CORS Middleware**: Permit cross-origin requests from `http://localhost:3000`.
2. **JSON Body Parser**: Parse incoming `application/json` request payloads.
3. **Multipart Form-Data Handling**: Process file uploads (`multer`) on `/api/predictions/disease`.
4. **JWT Authentication Guard**: Intercept requests to `/api/*` (except auth routes) and verify `Authorization: Bearer <token>`.

---

## 2. Database Collections & Mongoose Schemas

### 1. `User` Collection (`users`)
```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash with bcrypt
  role: { type: String, enum: ['Farm Manager', 'Worker', 'Agronomist', 'Admin'], default: 'Farm Manager' },
  farmName: { type: String, default: 'Green Valley Agri Enterprise' },
  avatar: { type: String }
}, { timestamps: true });
```

### 2. `Farm` Collection (`farms`)
```js
const farmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  totalArea: { type: Number, required: true }, // Hectares
  fieldCount: { type: Number, default: 0 },
  activeCrops: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'Under Maintenance'], default: 'Active' },
  description: { type: String },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { timestamps: true });
```

### 3. `Field` Collection (`fields`)
```js
const fieldSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  farmName: { type: String, required: true },
  name: { type: String, required: true },
  area: { type: Number, required: true }, // Hectares
  soilType: { type: String, required: true },
  currentCrop: { type: String, default: 'None' },
  status: { type: String, enum: ['Active', 'Fallow', 'Preparation', 'Harvesting'], default: 'Active' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  soilHealthScore: { type: Number, default: 80 },
  npk: {
    nitrogen: { type: Number, default: 40 },
    phosphorus: { type: Number, default: 35 },
    potassium: { type: Number, default: 45 }
  },
  pH: { type: Number, default: 6.5 },
  moisture: { type: Number, default: 25 }
}, { timestamps: true });
```

### 4. `Crop` Collection (`crops`)
```js
const cropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variety: { type: String, required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  fieldName: { type: String, required: true },
  plantingDate: { type: String, required: true },
  growthStage: { type: String, enum: ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'], default: 'Germination' },
  expectedHarvest: { type: String, required: true },
  status: { type: String, enum: ['Healthy', 'Needs Attention', 'Critical Risk'], default: 'Healthy' },
  estimatedYieldTons: { type: Number, default: 0 }
}, { timestamps: true });
```

### 5. `SoilRecord` Collection (`soilrecords`)
```js
const soilRecordSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  fieldName: { type: String, required: true },
  date: { type: String, required: true },
  nitrogen: { type: Number, required: true },
  phosphorus: { type: Number, required: true },
  potassium: { type: Number, required: true },
  pH: { type: Number, required: true },
  moisture: { type: Number, required: true },
  organicMatter: { type: Number, required: true },
  healthScore: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true });
```

### 6. `InventoryItem` Collection (`inventoryitems`)
```js
const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Equipment'], required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  reorderLevel: { type: Number, required: true },
  status: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
  supplier: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }
}, { timestamps: true });
```

### 7. `Worker` Collection (`workers`)
```js
const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  assignedField: { type: String, required: true },
  currentTask: { type: String, required: true },
  hoursLogged: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Working', 'On Leave'], default: 'Available' },
  phone: { type: String },
  email: { type: String },
  avatar: { type: String }
}, { timestamps: true });
```

### 8. `Expense` & `Income` Collections (`expenses`, `incomes`)
```js
// Expense
const expenseSchema = new mongoose.Schema({
  category: { type: String, enum: ['Seeds', 'Fertilizer', 'Labour', 'Fuel', 'Equipment', 'Pesticides', 'Other'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  fieldName: { type: String },
  paymentMethod: { type: String, default: 'Bank Transfer' }
}, { timestamps: true });

// Income
const incomeSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  buyer: { type: String, required: true },
  amount: { type: Number, required: true },
  quantityTons: { type: Number, required: true },
  date: { type: String, required: true },
  invoiceNumber: { type: String, required: true }
}, { timestamps: true });
```

---

## 3. Complete REST API Specifications

### Authentication Routes (`/api/auth`)
- **`POST /api/auth/login`**
  - **Request Body**: `{ "email": "user@farm.agri", "password": "password123" }`
  - **Response Payload**: `{ "user": { "id": "...", "name": "...", "email": "...", "role": "..." }, "token": "jwt-token-string" }`
- **`POST /api/auth/register`**
  - **Request Body**: `{ "name": "...", "email": "...", "password": "...", "role": "Farm Manager" }`
  - **Response Payload**: `{ "user": { ... }, "token": "jwt-token-string" }`
- **`GET /api/auth/me`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response Payload**: `{ "id": "...", "name": "...", "email": "...", "role": "..." }`

---

### Farm & Field Operations (`/api/farms`, `/api/fields`)
- **`GET /api/farms`**: Returns `Array<Farm>`
- **`POST /api/farms`**: Payload `{ "name": "...", "location": "...", "totalArea": 50, "description": "...", "lat": 12.97, "lng": 77.59 }` -> Returns `Farm`
- **`DELETE /api/farms/:id`**: Returns `{ "success": true }`
- **`GET /api/fields?farmId=...`**: Returns `Array<Field>`
- **`POST /api/fields`**: Payload `{ "farmId": "...", "farmName": "...", "name": "Field A", "area": 15.4, "soilType": "Loamy Clay", "currentCrop": "Tomato", "lat": 12.97, "lng": 77.59 }` -> Returns `Field`
- **`DELETE /api/fields/:id`**: Returns `{ "success": true }`

---

### Crops & Soil Chemistry (`/api/crops`, `/api/soil`)
- **`GET /api/crops`**: Returns `Array<Crop>`
- **`POST /api/crops`**: Payload `{ "name": "Tomato", "variety": "Roma VF", "fieldName": "Field A", "plantingDate": "2026-06-01", "growthStage": "Flowering", "expectedHarvest": "2026-08-25" }` -> Returns `Crop`
- **`DELETE /api/crops/:id`**: Returns `{ "success": true }`
- **`GET /api/soil?fieldId=...`**: Returns `Array<SoilRecord>`
- **`POST /api/soil`**: Payload `{ "fieldName": "Field A", "nitrogen": 42, "phosphorus": 38, "potassium": 55, "pH": 6.5, "moisture": 28, "organicMatter": 3.4, "notes": "..." }` -> Returns `SoilRecord`

---

### Weather, Inventory, Workers & Finance (`/api/weather`, `/api/inventory`, `/api/workers`, `/api/expenses`, `/api/income`, `/api/harvests`)
- **`GET /api/weather`**: Returns `{ "temperature": 27.5, "humidity": 68, "windSpeed": 14.2, "rainfall": 12.8, "condition": "Partly Cloudy", "location": "...", "timestamp": "...", "forecast": [...], "alert": { ... } }`
- **`GET /api/inventory`**: Returns `Array<InventoryItem>`
- **`POST /api/inventory`**: Payload `{ "name": "Urea", "category": "Fertilizers", "quantity": 20, "unit": "bags", "reorderLevel": 15, "supplier": "...", "pricePerUnit": 30 }` -> Returns `InventoryItem`
- **`DELETE /api/inventory/:id`**: Returns `{ "success": true }`
- **`GET /api/workers`**: Returns `Array<Worker>`
- **`POST /api/workers`**: Payload `{ "name": "...", "role": "...", "assignedField": "...", "currentTask": "...", "phone": "...", "email": "..." }` -> Returns `Worker`
- **`GET /api/expenses`**: Returns `Array<Expense>`
- **`POST /api/expenses`**: Payload `{ "category": "Fertilizer", "description": "...", "amount": 500, "date": "2026-08-15", "fieldName": "Field A", "paymentMethod": "Bank Transfer" }` -> Returns `Expense`
- **`GET /api/income`**: Returns `Array<Income>`
- **`POST /api/income`**: Payload `{ "cropName": "Tomato", "buyer": "...", "amount": 5000, "quantityTons": 6.0, "date": "2026-08-10" }` -> Returns `Income`
- **`GET /api/harvests`**: Returns `Array<Harvest>`
- **`GET /api/recommendations`**: Returns `Array<DecisionSupportItem>`
- **`GET /api/alerts`**: Returns `Array<Alert>`
- **`PATCH /api/alerts/:id/read`**: Returns `{ "success": true }`

---

## 4. AI/ML Prediction Proxy Endpoints (`/api/predictions`)

*The backend proxies requests to Python FastAPI microservice (`http://localhost:8000`).*

### 1. `POST /api/predictions/crop`
- **Request**: `{ "nitrogen": 55, "phosphorus": 40, "potassium": 50, "pH": 6.5, "temperature": 26, "humidity": 65, "rainfall": 120 }`
- **Response**:
```json
[
  { "crop": "Tomato (Roma VF)", "confidence": 94, "suitabilityReason": "Optimal nitrogen & pH 6.5", "expectedYield": "3.9 tons/ha" },
  { "crop": "Potato (Yukon Gold)", "confidence": 86, "suitabilityReason": "Soil porosity ideal for tuber growth", "expectedYield": "4.2 tons/ha" }
]
```

### 2. `POST /api/predictions/yield`
- **Request**: `{ "crop": "Tomato", "areaHectares": 15.4, "nitrogen": 42, "phosphorus": 38, "potassium": 55, "rainfall": 120, "temperature": 26 }`
- **Response**:
```json
{
  "predictedYieldPerHectare": 3.8,
  "totalHarvestTons": 58.5,
  "confidenceScore": 89,
  "influencingFactors": [
    "Soil Nitrogen content (42 mg/kg) is positive contributor (+12%)",
    "Seasonal Rainfall forecast (120 mm) provides 92% of moisture demand"
  ]
}
```

### 3. `POST /api/predictions/fertilizer`
- **Request**: `{ "crop": "Tomato", "currentN": 35, "currentP": 28, "currentK": 40, "pH": 6.5 }`
- **Response**:
```json
{
  "soilCondition": "Low Nitrogen (35 mg/kg), Moderate P & K",
  "cropRequirement": "Tomato requires 60:50:70 NPK ratio for peak yield",
  "nutrientGap": { "nitrogen": 25, "phosphorus": 22, "potassium": 30 },
  "recommendedFertilizer": "Urea (46% N) + NPK 15-15-15 Split Application",
  "recommendedDosage": "120 kg Urea per hectare + 50 kg NPK complex",
  "recommendedTiming": "Apply 50% during basal soil preparation and 50% at flowering stage"
}
```

### 4. `POST /api/predictions/disease`
- **Request**: `multipart/form-data` with leaf image binary file (`file`)
- **Response**:
```json
{
  "diseaseName": "Tomato Early Blight (Alternaria solani)",
  "confidence": 94,
  "severity": "Moderate",
  "description": "Concentric dark lesions with yellow chlorotic halos observed on middle canopy foliage.",
  "recommendedAction": "Apply Copper Hydroxide or Chlorothalonil fungicide spray within 48 hours.",
  "affectedField": "Field A - Tomato Plot"
}
```
