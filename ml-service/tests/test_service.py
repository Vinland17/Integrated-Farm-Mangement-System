import pytest
import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.disease_model import disease_engine, TOMATO_CLASSES

client = TestClient(app)

def test_model_loaded_and_class_count():
    assert disease_engine.model is not None, "EfficientNet-B0 model failed to load"
    assert len(disease_engine.classes) == 10, "Model must have exactly 10 output classes"
    assert disease_engine.classes[0] == "Tomato_Bacterial_spot"
    assert disease_engine.classes[1] == "Tomato_Early_blight"
    assert disease_engine.classes[2] == "Tomato_Late_blight"
    assert disease_engine.classes[3] == "Tomato_Leaf_Mold"
    assert disease_engine.classes[4] == "Tomato_Septoria_leaf_spot"
    assert disease_engine.classes[5] == "Tomato_Spider_mites_Two_spotted_spider_mite"
    assert disease_engine.classes[6] == "Tomato_Target_Spot"
    assert disease_engine.classes[7] == "Tomato_Tomato_YellowLeaf_Curl_Virus"
    assert disease_engine.classes[8] == "Tomato_Tomato_mosaic_virus"
    assert disease_engine.classes[9] == "Tomato_healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Operational"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["model_loaded"] is True

def test_predict_disease_api_endpoint():
    img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)

    files = {"file": ("tomato_leaf.jpg", buffer, "image/jpeg")}
    response = client.post("/api/disease/predict", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "disease" in data
    assert data["disease"] in TOMATO_CLASSES
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 100.0
    assert "top_predictions" in data
    assert len(data["top_predictions"]) == 3

def test_predict_disease_alias_endpoint():
    img = Image.new("RGB", (224, 224), color=(30, 150, 40))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    files = {"file": ("tomato_leaf.png", buffer, "image/png")}
    response = client.post("/predict/disease", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "disease" in data
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 100.0

def test_invalid_file_rejection():
    buffer = io.BytesIO(b"Not an image content")
    files = {"file": ("invalid.txt", buffer, "text/plain")}
    response = client.post("/api/disease/predict", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data

def test_predict_crop():
    payload = {
        "nitrogen": 60,
        "phosphorus": 50,
        "potassium": 70,
        "temperature": 26,
        "humidity": 65,
        "pH": 6.5,
        "rainfall": 120
    }
    response = client.post("/predict/crop", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_predict_yield():
    payload = {
        "crop": "Tomato",
        "areaHectares": 2.5,
        "nitrogen": 45,
        "phosphorus": 35,
        "potassium": 45,
        "rainfall": 110,
        "temperature": 24
    }
    response = client.post("/predict/yield", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predictedYieldPerHectare" in data

def test_predict_fertilizer():
    payload = {
        "crop": "Tomato",
        "currentN": 30,
        "currentP": 20,
        "currentK": 35,
        "pH": 6.5
    }
    response = client.post("/predict/fertilizer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendedFertilizer" in data
