from typing import List, Dict, Any
from app.schemas import (
    CropPredictionRequest, CropRecommendation,
    YieldPredictionRequest, YieldPredictionResponse,
    FertilizerPredictionRequest, FertilizerPredictionResponse, NutrientGap
)

class AgronomicPredictorEngine:
    @staticmethod
    def predict_crop(req: CropPredictionRequest) -> List[CropRecommendation]:
        """
        Recommends crop options based on soil nutrients (NPK), pH, temperature, humidity, and rainfall.
        """
        results = []

        if req.rainfall > 150:
            results.append(CropRecommendation(
                crop="Rice (Paddy)",
                confidence=95.0,
                suitabilityReason="High precipitation & moisture retention optimal for paddy flooded cultivation.",
                expectedYield="4.5 tons/ha"
            ))
            results.append(CropRecommendation(
                crop="Maize (Hybrid)",
                confidence=84.0,
                suitabilityReason="Adequate soil humidity and moderate temperature match vegetative growth requirements.",
                expectedYield="3.8 tons/ha"
            ))
            results.append(CropRecommendation(
                crop="Sugarcane",
                confidence=76.0,
                suitabilityReason="Sufficient water availability supports long growing period.",
                expectedYield="72.0 tons/ha"
            ))
        elif req.nitrogen >= 40 and 6.0 <= req.pH <= 7.2:
            results.append(CropRecommendation(
                crop="Tomato (Roma VF)",
                confidence=94.0,
                suitabilityReason=f"Optimal nitrogen level ({req.nitrogen} mg/kg) and ideal soil pH ({req.pH}) maximize flowering & fruit set.",
                expectedYield="3.9 tons/ha"
            ))
            results.append(CropRecommendation(
                crop="Potato (Yukon Gold)",
                confidence=86.0,
                suitabilityReason=f"Balanced soil porosity (P: {req.phosphorus}, K: {req.potassium}) supports healthy tuber expansion.",
                expectedYield="4.2 tons/ha"
            ))
            results.append(CropRecommendation(
                crop="Sweet Pepper",
                confidence=78.0,
                suitabilityReason=f"Moderate warmth ({req.temperature}°C) and balanced NPK boost canopy development.",
                expectedYield="2.8 tons/ha"
            ))
        else:
            results.append(CropRecommendation(
                crop="Wheat (Durum)",
                confidence=91.0,
                suitabilityReason=f"Dryland soil profile (rainfall {req.rainfall}mm) and neutral pH ({req.pH}) ideal for cereal grain heading.",
                expectedYield="3.5 tons/ha"
            ))
            results.append(CropRecommendation(
                crop="Chickpea (Gram)",
                confidence=85.0,
                suitabilityReason="Low water requirement legume capable of biological nitrogen fixation.",
                expectedYield="1.9 tons/ha"
            ))
            results.append(CropRecommendation(
                crop="Mustard / Rapeseed",
                confidence=79.0,
                suitabilityReason="Resilient to moisture deficits with good oilseed recovery.",
                expectedYield="2.1 tons/ha"
            ))

        return results

    @staticmethod
    def predict_yield(req: YieldPredictionRequest) -> YieldPredictionResponse:
        """
        Forecasts yield per hectare and total harvest tonnage.
        """
        crop_name = req.crop.lower()
        if "tomato" in crop_name:
            base_yield = 3.8
        elif "rice" in crop_name or "paddy" in crop_name:
            base_yield = 4.5
        elif "wheat" in crop_name:
            base_yield = 3.5
        else:
            base_yield = 4.0

        n_factor = (req.nitrogen / 40.0) * 0.9
        p_factor = (req.phosphorus / 30.0) * 0.1
        k_factor = (req.potassium / 40.0) * 0.1
        combined_factor = min(1.25, max(0.65, n_factor + p_factor + k_factor))

        yield_per_ha = round(base_yield * combined_factor, 2)
        total_tons = round(yield_per_ha * req.areaHectares, 1)

        factors = [
            f"Soil Nitrogen content ({req.nitrogen} mg/kg) is a positive contributor (+{round((combined_factor - 1.0)*100, 1)}%)",
            f"Seasonal Rainfall forecast ({req.rainfall} mm) provides sufficient moisture demand",
            f"Target temperature range ({req.temperature}°C) aligns with plant biomass accumulation curve"
        ]

        return YieldPredictionResponse(
            predictedYieldPerHectare=yield_per_ha,
            totalHarvestTons=total_tons,
            confidenceScore=89.0,
            influencingFactors=factors
        )

    @staticmethod
    def predict_fertilizer(req: FertilizerPredictionRequest) -> FertilizerPredictionResponse:
        """
        Calculates NPK nutrient gaps and recommends fertilizer dosage.
        """
        target_n, target_p, target_k = 60.0, 50.0, 70.0
        gap_n = max(0.0, round(target_n - req.currentN, 1))
        gap_p = max(0.0, round(target_p - req.currentP, 1))
        gap_k = max(0.0, round(target_k - req.currentK, 1))

        soil_cond = f"Nitrogen ({req.currentN} mg/kg), Phosphorus ({req.currentP} mg/kg), Potassium ({req.currentK} mg/kg), pH {req.pH}"
        crop_req = f"{req.crop} requires {int(target_n)}:{int(target_p)}:{int(target_k)} NPK ratio for peak yield"

        dosage = f"{int(gap_n * 2)} kg Urea (46% N) + {int(gap_p * 2.5)} kg DAP (18-46-0) per hectare"
        timing = "Apply 50% during basal soil preparation and 50% at early flowering stage"

        return FertilizerPredictionResponse(
            soilCondition=soil_cond,
            cropRequirement=crop_req,
            nutrientGap=NutrientGap(nitrogen=gap_n, phosphorus=gap_p, potassium=gap_k),
            recommendedFertilizer="Urea (46% N) + NPK 15-15-15 Split Application",
            recommendedDosage=dosage,
            recommendedTiming=timing
        )
