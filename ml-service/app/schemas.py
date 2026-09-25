from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# --- Health Schemas ---
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    active_model_name: Optional[str] = None

# --- Crop Recommendation Schemas ---
class CropPredictionRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, description="Nitrogen content in soil (mg/kg)")
    phosphorus: float = Field(..., ge=0, description="Phosphorus content in soil (mg/kg)")
    potassium: float = Field(..., ge=0, description="Potassium content in soil (mg/kg)")
    temperature: float = Field(25.0, description="Average temperature in Celsius")
    humidity: float = Field(65.0, description="Relative humidity (%)")
    pH: float = Field(6.5, ge=0, le=14, description="Soil pH level")
    rainfall: float = Field(100.0, ge=0, description="Annual / seasonal rainfall (mm)")

class CropRecommendation(BaseModel):
    crop: str
    confidence: float
    suitabilityReason: str
    expectedYield: str

# --- Yield Forecasting Schemas ---
class YieldPredictionRequest(BaseModel):
    crop: str = Field(..., description="Target crop name")
    areaHectares: float = Field(1.0, gt=0, description="Field size in hectares")
    nitrogen: float = Field(40.0, ge=0)
    phosphorus: float = Field(30.0, ge=0)
    potassium: float = Field(40.0, ge=0)
    rainfall: float = Field(100.0, ge=0)
    temperature: float = Field(25.0)

class YieldPredictionResponse(BaseModel):
    predictedYieldPerHectare: float
    totalHarvestTons: float
    confidenceScore: float
    influencingFactors: List[str]

# --- Fertilizer Schemas ---
class FertilizerPredictionRequest(BaseModel):
    crop: str = Field("Tomato", description="Crop being cultivated")
    currentN: float = Field(30.0, ge=0, description="Current soil Nitrogen (mg/kg)")
    currentP: float = Field(25.0, ge=0, description="Current soil Phosphorus (mg/kg)")
    currentK: float = Field(35.0, ge=0, description="Current soil Potassium (mg/kg)")
    pH: float = Field(6.5, ge=0, le=14, description="Soil pH level")

class NutrientGap(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float

class FertilizerPredictionResponse(BaseModel):
    soilCondition: str
    cropRequirement: str
    nutrientGap: NutrientGap
    recommendedFertilizer: str
    recommendedDosage: str
    recommendedTiming: str

# --- Disease Schemas ---
class TopPredictionItem(BaseModel):
    disease: str
    display_name: str
    confidence: float

class DiseasePredictionResponse(BaseModel):
    success: bool = True
    disease: str
    display_name: Optional[str] = None
    confidence: float
    top_predictions: Optional[List[TopPredictionItem]] = None
    diseaseName: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    recommendedAction: Optional[str] = None
    affectedField: Optional[str] = "Uploaded Image Analysis"

# --- Model Management Schemas ---
class ModelStatusResponse(BaseModel):
    modelLoaded: bool
    modelPath: Optional[str]
    modelFilename: Optional[str]
    modelSizeBytes: Optional[int]
    classesCount: int
    device: str
    classes: List[str]
