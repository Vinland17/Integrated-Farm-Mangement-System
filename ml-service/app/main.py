import os
import shutil
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    HealthResponse, CropPredictionRequest, CropRecommendation,
    YieldPredictionRequest, YieldPredictionResponse,
    FertilizerPredictionRequest, FertilizerPredictionResponse,
    DiseasePredictionResponse, ModelStatusResponse
)
from app.disease_model import disease_engine, TOMATO_CLASSES
from app.predictor import AgronomicPredictorEngine

app = FastAPI(
    title="Integrated Farm Management System - ML Microservice",
    description="EfficientNet-B0 Tomato Disease Computer Vision & Agronomic Recommendation Service.",
    version="1.0.0"
)

# Enable CORS for frontend and backend gateways
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def read_root():
    return {
        "service": "Farm Management ML Microservice",
        "status": "Operational",
        "version": "1.0.0",
        "model": "EfficientNet-B0 Tomato Disease Classifier",
        "docs_url": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["General"])
def health_check():
    return HealthResponse(
        status="OK",
        service="ml-service",
        version="1.0.0",
        model_loaded=disease_engine.model is not None,
        active_model_name=os.path.basename(disease_engine.model_path) if disease_engine.model_path else None
    )

@app.get("/model/status", response_model=ModelStatusResponse, tags=["Model Management"])
def get_model_status():
    model_path = disease_engine.model_path
    size_bytes = os.path.getsize(model_path) if model_path and os.path.exists(model_path) else None
    return ModelStatusResponse(
        modelLoaded=disease_engine.model is not None,
        modelPath=model_path,
        modelFilename=os.path.basename(model_path) if model_path else None,
        modelSizeBytes=size_bytes,
        classesCount=len(disease_engine.classes),
        device=str(disease_engine.device),
        classes=disease_engine.classes
    )

@app.post("/model/upload", tags=["Model Management"])
async def upload_model(file: UploadFile = File(...)):
    """
    Upload a new trained PyTorch model (.pth or .pt).
    Replaces active weights and reloads EfficientNet-B0 inference engine.
    """
    if not (file.filename.endswith(".pth") or file.filename.endswith(".pt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a PyTorch model file (.pth or .pt)."
        )

    target_dir = os.path.abspath("models")
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, file.filename)

    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        success = disease_engine.load_model(target_path)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Model file saved but failed to load PyTorch weights."
            )

        return {
            "message": f"Successfully uploaded and loaded model '{file.filename}'",
            "modelPath": target_path,
            "fileSizeBytes": os.path.getsize(target_path)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload model file: {str(e)}"
        )

async def _process_disease_prediction(file: UploadFile) -> DiseasePredictionResponse:
    """
    Helper function to validate and execute disease prediction on uploaded leaf image file.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in request."
        )

    # Basic MIME / extension validation
    valid_extensions = (".jpg", ".jpeg", ".png", ".webp", ".bmp")
    filename_lower = file.filename.lower()
    content_type = file.content_type or ""

    if not (content_type.startswith("image/") or filename_lower.endswith(valid_extensions)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a valid image file (JPEG, PNG, WEBP)."
        )

    try:
        contents = await file.read()
        if not contents or len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image file is empty."
            )

        prediction = disease_engine.predict(contents)
        return DiseasePredictionResponse(**prediction)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while analyzing the image."
        )

@app.post("/api/disease/predict", response_model=DiseasePredictionResponse, tags=["Predictions"])
async def api_predict_disease(file: UploadFile = File(...)):
    """
    Primary API Endpoint: Accepts tomato leaf image (multipart/form-data) and returns EfficientNet-B0 disease prediction.
    """
    return await _process_disease_prediction(file)

@app.post("/predict/disease", response_model=DiseasePredictionResponse, tags=["Predictions"])
async def predict_disease(file: UploadFile = File(...)):
    """
    Secondary API Endpoint alias for backend proxy compatibility.
    """
    return await _process_disease_prediction(file)

@app.post("/predict/crop", response_model=List[CropRecommendation], tags=["Predictions"])
def predict_crop(req: CropPredictionRequest):
    return AgronomicPredictorEngine.predict_crop(req)

@app.post("/predict/yield", response_model=YieldPredictionResponse, tags=["Predictions"])
def predict_yield(req: YieldPredictionRequest):
    return AgronomicPredictorEngine.predict_yield(req)

@app.post("/predict/fertilizer", response_model=FertilizerPredictionResponse, tags=["Predictions"])
def predict_fertilizer(req: FertilizerPredictionRequest):
    return AgronomicPredictorEngine.predict_fertilizer(req)
