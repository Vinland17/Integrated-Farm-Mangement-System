# Machine Learning Microservice (`ml-service`) - Context & Status Log

## 📌 Project Overview
`ml-service` is a standalone, FastAPI-powered Machine Learning microservice for the **Integrated Farm Management System**.

Its primary capabilities include:
1. **Plant Leaf Disease Diagnosis**: Computer vision classification for leaf diseases.
2. **Crop Recommendation Engine**: Soil-nutrient (NPK, pH) and climate-based crop suitability matching.
3. **Yield Performance Forecasting**: Estimating harvest tonnage per hectare.
4. **Fertilizer Dosage Calculation**: Recommending optimal NPK fertilizer split applications to address soil nutrient deficits.
5. **Dynamic Model Reloading**: Support for uploading and serving custom PyTorch model weights (`.pth`/`.pt`).

---

## 🕒 Recent Changes

1. **Training Datasets & Scripts Removal**:
   - Deleted all raw and split training dataset folders (`datasets/`).
   - Removed training scripts (`training/`) and notebook (`modelTrain.ipynb`).
   - Converted `ml-service` into a lean model-serving microservice.

2. **Model Serving & Dynamic Auto-Architecture Engine**:
   - Implemented PyTorch model inference engine in [`app/disease_model.py`](file:///c:/Users/Rohith%20S%20D/OneDrive/Documents/Farm%20Management/ml-service/app/disease_model.py).
   - Added auto-architecture detection supporting EfficientNet, MobileNet, and ResNet state dicts.
   - Organized active model checkpoint into [`models/best_tomato_disease_model.pth`](file:///c:/Users/Rohith%20S%20D/OneDrive/Documents/Farm%20Management/ml-service/models/best_tomato_disease_model.pth).

3. **FastAPI Endpoints**:
   - Created [`app/main.py`](file:///c:/Users/Rohith%20S%20D/OneDrive/Documents/Farm%20Management/ml-service/app/main.py) with `/health`, `/model/status`, `/model/upload`, `/predict/disease`, `/predict/crop`, `/predict/yield`, and `/predict/fertilizer` endpoints.

4. **Verification & Testing**:
   - Verified 100% test suite passing with `pytest` (`7/7` passing).
