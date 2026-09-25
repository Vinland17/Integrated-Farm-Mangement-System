/**
 * Gemini AI Service
 * Powered by Google Gemini 2.5 Flash for Agronomic Decision Support
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call Gemini API with structured JSON output
 */
const callGemini = async (prompt, systemInstruction = '') => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env');
  }

  const endpoint = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini API returned an empty response');
  }

  return JSON.parse(textOutput);
};

/**
 * Generate AI Crop Recommendations based on soil chemistry and environmental telemetry
 */
const recommendCrops = async ({
  nitrogen = 40,
  phosphorus = 30,
  potassium = 40,
  pH = 6.5,
  temperature = 25,
  humidity = 60,
  rainfall = 100,
}) => {
  const systemInstruction =
    'You are a senior agricultural research scientist and precision agronomy expert. You analyze soil chemistry and microclimate telemetry against historical agronomic datasets to recommend optimal crops for farmers.';

  const prompt = `Analyze the following farm field soil and environmental telemetry:
- Nitrogen (N): ${nitrogen} mg/kg
- Phosphorus (P): ${phosphorus} mg/kg
- Potassium (K): ${potassium} mg/kg
- Soil pH: ${pH}
- Ambient Temperature: ${temperature} °C
- Relative Humidity: ${humidity} %
- Seasonal Rainfall: ${rainfall} mm

Task:
Determine the top 3 most suitable crops for these exact conditions based on agronomic science and historical crop cultivation data.
For each crop, provide:
1. "crop": Common crop name and recommended cultivar (e.g. "Rice (Paddy)", "Tomato (Roma VF)", "Maize (Hybrid)")
2. "confidence": A suitability confidence score between 65.0 and 98.0 based on how well the NPK, pH, temperature, and moisture match the crop's physiological requirements.
3. "suitabilityReason": A detailed, realistic agronomic explanation detailing why this specific soil profile and climate conditions suit this crop.
4. "expectedYield": Realistic projected yield per hectare (e.g. "4.2 tons/ha").

Respond with ONLY a JSON array adhering strictly to this schema:
[
  {
    "crop": "string",
    "confidence": 92.5,
    "suitabilityReason": "string",
    "expectedYield": "string"
  }
]`;

  return await callGemini(prompt, systemInstruction);
};

/**
 * Generate AI Harvest Yield Forecasting
 */
const predictYield = async ({
  crop = 'Tomato',
  areaHectares = 1,
  nitrogen = 40,
  phosphorus = 30,
  potassium = 40,
  pH = 6.5,
  temperature = 25,
  humidity = 60,
  rainfall = 100,
}) => {
  const systemInstruction =
    'You are an expert crop yield forecasting and agricultural biomass modeling scientist.';

  const prompt = `Forecast the harvest yield for the following crop production scenario:
- Target Crop: ${crop}
- Field Area: ${areaHectares} hectare(s)
- Soil Chemistry: Nitrogen ${nitrogen} mg/kg, Phosphorus ${phosphorus} mg/kg, Potassium ${potassium} mg/kg, pH ${pH}
- Climate: Temperature ${temperature}°C, Humidity ${humidity}%, Rainfall ${rainfall} mm

Task:
Calculate the projected yield per hectare and total harvest volume, taking into account soil nutrient balance and moisture supply.

Respond with ONLY a JSON object adhering to this schema:
{
  "predictedYieldPerHectare": 4.15,
  "totalHarvestTons": 4.15,
  "confidenceScore": 88.5,
  "influencingFactors": [
    "Specific factor analyzing soil NPK contribution",
    "Specific factor analyzing precipitation/moisture impact",
    "Specific factor analyzing temperature impact on crop phenology"
  ]
}`;

  return await callGemini(prompt, systemInstruction);
};

/**
 * Generate AI Fertilizer Deficit & Dosage Recommendation
 */
const recommendFertilizer = async ({
  crop = 'Tomato',
  currentN = 30,
  currentP = 25,
  currentK = 35,
  pH = 6.5,
}) => {
  const systemInstruction =
    'You are a soil fertility specialist and plant nutrition expert.';

  const prompt = `Analyze soil fertility deficits and calculate customized fertilizer dosages:
- Target Crop: ${crop}
- Current Soil Test: Nitrogen (N): ${currentN} mg/kg, Phosphorus (P): ${currentP} mg/kg, Potassium (K): ${currentK} mg/kg, pH: ${pH}

Task:
Calculate the nutrient gap (Target - Current) for N, P, and K. Recommend specific commercial fertilizer formulations (e.g. Urea, DAP, MOP, or NPK complex), precise application dosage per hectare, and split application timing.

Respond with ONLY a JSON object adhering to this schema:
{
  "soilCondition": "string summarizing current soil NPK and pH",
  "cropRequirement": "string describing target N:P:K ratio for peak yield",
  "nutrientGap": {
    "nitrogen": 25.0,
    "phosphorus": 15.0,
    "potassium": 20.0
  },
  "recommendedFertilizer": "string with specific fertilizer names",
  "recommendedDosage": "string with exact kg per hectare instructions",
  "recommendedTiming": "string with split application timing (e.g. basal vs top-dressing)"
}`;

  return await callGemini(prompt, systemInstruction);
};

module.exports = {
  recommendCrops,
  predictYield,
  recommendFertilizer,
};
