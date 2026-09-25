# 🌾 Integrated Farm Management System - Machine Learning Microservice (`ml-service`)

![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C.svg?logo=pytorch)
![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI_Server-4051B5.svg)
![Status](https://img.shields.io/badge/Status-100%25_Operational-brightgreen)

`ml-service` is a dedicated, high-performance RESTful Machine Learning microservice engineered with **Python**, **FastAPI**, **PyTorch**, and **Uvicorn**. It powers the intelligence layer of the **Integrated Farm Management System (PRJ_533)**, providing real-time computer vision leaf disease diagnosis, soil-nutrient crop suitability matching, harvest yield forecasting per hectare, and fertilizer deficit dosage calculations.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Python** (v3.10 or higher)
- **pip** (Python package installer)

### 1. Installation & Environment Activation
Navigate into the `ml-service/` directory and set up a Python virtual environment:

```bash
# Navigate to microservice directory
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell / CMD):
venv\Scripts\activate
# On macOS / Linux:
# source venv/bin/activate
```

### 2. Install Dependencies
Install all required Python data science and deep learning libraries:

```bash
pip install -r requirements.txt
```

### 3. Launch FastAPI Microservice Server
Execute the Uvicorn launcher script:

```bash
python run.py
```
*(Alternatively: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`)*

Expected Terminal Output:
```text
Starting ML Service FastAPI Server on http://0.0.0.0:8000
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

- **Microservice Base URL**: **`http://localhost:8000`**
- **Interactive OpenAPI Documentation (Swagger UI)**: **`http://localhost:8000/docs`**
- **Alternative ReDoc Documentation**: **`http://localhost:8000/redoc`**

### 4. Run Automated Test Suite
Execute PyTest to verify all endpoints and prediction engines:

```bash
pytest
```
*(Or: `python -m pytest`)*

---

## 📁 Directory & Architecture Layout

```text
ml-service/
├── app/
│   ├── __init__.py          # Python package initializer
│   ├── main.py              # FastAPI application initialization & HTTP router endpoints
│   ├── schemas.py           # Pydantic request & response validation data models
│   ├── disease_model.py     # PyTorch model engine (Auto-architecture state dict loader)
│   ├── predictor.py         # Agronomic decision support & heuristic calculation engine
│   └── utils.py             # Image preprocessing, PIL transformations & helper utilities
│
├── models/
│   └── best_tomato_disease_model.pth # Active PyTorch deep learning weights checkpoint
│
├── tests/
│   └── test_service.py      # Automated PyTest test suite (100% PASS)
│
├── .gitignore               # Git ignore rules for virtual environments & cache
├── context.md               # Architecture context log
├── README.md                # Microservice documentation & run guide
├── requirements.txt         # Dependencies manifest (FastAPI, PyTorch, Torchvision, Pillow)
└── run.py                   # Uvicorn ASGI server launcher script
```

---

## 📡 REST API Endpoint Specifications

All response payloads adhere to structured Pydantic schemas.

| Method | Endpoint | Content-Type | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | `application/json` | Returns microservice operational health and model status |
| `GET` | `/model/status` | `application/json` | Detailed model metadata, parameter counts, PyTorch device (CPU/CUDA), and class labels |
| `POST` | `/model/upload` | `multipart/form-data` | Upload new `.pth` or `.pt` PyTorch model weights to hot-reload serving model |
| `POST` | `/predict/disease` | `multipart/form-data` | Computer vision diagnosis for crop leaf diseases from uploaded image file |
| `POST` | `/predict/crop` | `application/json` | Recommend optimal crop based on soil NPK, pH, ambient temperature, humidity, and rainfall |
| `POST` | `/predict/yield` | `application/json` | Forecast expected crop harvest tonnage per hectare based on soil & field conditions |
| `POST` | `/predict/fertilizer` | `application/json` | Calculate soil NPK nutrient deficits and output custom fertilizer dosage recommendations |

---

## 🤖 Prediction Engines & AI Capabilities

### 1. Plant Leaf Disease Computer Vision (`disease_model.py`)
- **Architecture**: PyTorch Convolutional Neural Network (CNN) with auto-architecture detection supporting ResNet, MobileNet, and EfficientNet state dicts.
- **Model Checkpoint**: Active weights stored in `models/best_tomato_disease_model.pth`.
- **Input**: Image file (`.jpg`, `.png`, `.jpeg`). Preprocessed via Torchvision transforms (Resizing to 224x224, Normalization).
- **Output**: Diagnostic class name (e.g., `Tomato___Bacterial_spot`, `Tomato___Late_blight`, `Healthy`), confidence score percentage, severity rating, and treatment advice.

### 2. Crop Recommendation Engine (`predictor.py`)
- **Input Parameters**: Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, Temperature (°C), Humidity (%), Rainfall (mm).
- **Output**: Ranked suitable crops (e.g., Rice, Maize, Tomato, Cotton, Wheat) tailored to soil chemistry and environmental climate.

### 3. Yield Performance Forecaster (`predictor.py`)
- **Input Parameters**: Selected crop, field area (hectares), historical rainfall, soil chemical profile, average temperature.
- **Output**: Estimated total yield in metric tons, yield density (tons/hectare), and potential yield efficiency.

### 4. Fertilizer Deficit & Dosage Planner (`predictor.py`)
- **Input Parameters**: Current soil NPK levels, targeted crop, growth stage.
- **Output**: Nutrient deficit analysis and recommended fertilizer applications (Urea, DAP, MOP) with exact kg/hectare dosage.

---

## 🛠️ Tech Stack & Key Libraries

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | $\ge 0.100.0$ | High-performance Python ASGI web framework |
| **Uvicorn** | $\ge 0.22.0$ | Lightning-fast ASGI web server implementation |
| **PyTorch** | $\ge 2.0.0$ | Deep learning framework powering computer vision model inference |
| **Torchvision** | $\ge 0.15.0$ | Computer vision utilities and image transformations |
| **Pillow (PIL)** | $\ge 10.0.0$ | Image manipulation and decoding |
| **Pydantic** | $\ge 2.0.0$ | Strict data validation and settings management |
| **PyTest** | $\ge 7.4.0$ | Automated API endpoint testing framework |
