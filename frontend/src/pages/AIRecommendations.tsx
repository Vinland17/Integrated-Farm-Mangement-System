import React, { useState } from 'react';
import { Sparkles, Sprout, TrendingUp, FlaskConical, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { predictionService } from '../services/predictionService';
import {
  CropRecommendationResult,
  YieldPredictionResult,
  FertilizerRecommendationResult,
} from '../types';
import { useToast } from '../hooks/useToast';

export const AIRecommendations: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'crop' | 'yield' | 'fertilizer'>('crop');
  const [anomalyError, setAnomalyError] = useState<string | null>(null);

  // Crop Rec Form State
  const [nitrogen, setNitrogen] = useState(55);
  const [phosphorus, setPhosphorus] = useState(40);
  const [potassium, setPotassium] = useState(50);
  const [pH, setPH] = useState(6.5);
  const [temperature, setTemperature] = useState(26);
  const [humidity, setHumidity] = useState(65);
  const [rainfall, setRainfall] = useState(120);
  const [cropResults, setCropResults] = useState<CropRecommendationResult[] | null>(null);
  const [isCropLoading, setIsCropLoading] = useState(false);

  // Yield Pred Form State
  const [selectedCrop, setSelectedCrop] = useState('Tomato (Roma VF)');
  const [areaHectares, setAreaHectares] = useState(15.4);
  const [yieldResult, setYieldResult] = useState<YieldPredictionResult | null>(null);
  const [isYieldLoading, setIsYieldLoading] = useState(false);

  // Fertilizer Form State
  const [fertCrop, setFertCrop] = useState('Tomato');
  const [fertN, setFertN] = useState(35);
  const [fertP, setFertP] = useState(28);
  const [fertK, setFertK] = useState(40);
  const [fertResult, setFertResult] = useState<FertilizerRecommendationResult | null>(null);
  const [isFertLoading, setIsFertLoading] = useState(false);

  const handleRecommendCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCropLoading(true);
    setAnomalyError(null);
    try {
      const res = await predictionService.recommendCrop({
        nitrogen,
        phosphorus,
        potassium,
        pH,
        temperature,
        humidity,
        rainfall,
      });
      setCropResults(res);
      showToast('ML Model Evaluated', 'Ranked crop suitability probabilities generated.', 'success');
    } catch (err: any) {
      setCropResults(null);
      const msg = err?.response?.data?.message || 'Failed to generate crop recommendation.';
      setAnomalyError(msg);
      showToast('Agronomic Anomaly', msg, 'error');
    } finally {
      setIsCropLoading(false);
    }
  };

  const handlePredictYield = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsYieldLoading(true);
    setAnomalyError(null);
    try {
      const res = await predictionService.predictYield({
        crop: selectedCrop,
        areaHectares,
        nitrogen,
        phosphorus,
        potassium,
        rainfall,
        temperature,
      });
      setYieldResult(res);
      showToast('Yield Forecast Generated', 'Predictive yield curve calculated.', 'success');
    } catch (err: any) {
      setYieldResult(null);
      const msg = err?.response?.data?.message || 'Failed to predict yield.';
      setAnomalyError(msg);
      showToast('Agronomic Anomaly', msg, 'error');
    } finally {
      setIsYieldLoading(false);
    }
  };

  const handleGetFertilizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFertLoading(true);
    setAnomalyError(null);
    try {
      const res = await predictionService.getFertilizerRecommendation({
        crop: fertCrop,
        currentN: fertN,
        currentP: fertP,
        currentK: fertK,
        pH,
      });
      setFertResult(res);
      showToast('Nutrient Gap Calculated', 'Fertilizer dosage advisory ready.', 'success');
    } catch (err: any) {
      setFertResult(null);
      const msg = err?.response?.data?.message || 'Failed to generate fertilizer recommendation.';
      setAnomalyError(msg);
      showToast('Agronomic Anomaly', msg, 'error');
    } finally {
      setIsFertLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="AI Machine Learning Recommendation Engine"
        subtitle="Predictive crop suitability models, harvest yield forecasting algorithms, and soil nutrient gap optimization."
        icon={<Sparkles className="w-6 h-6" />}
      />

      {/* Main Tab Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('crop')}
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            activeTab === 'crop'
              ? 'bg-agri-900 text-white border-agri-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'crop' ? 'bg-agri-700 text-white' : 'bg-agri-50 text-agri-700'}`}>
            <Sprout className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm">Crop Recommendation</h4>
            <p className={`text-xs ${activeTab === 'crop' ? 'text-agri-200' : 'text-slate-500'}`}>Soil & Climate Match</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('yield')}
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            activeTab === 'yield'
              ? 'bg-agri-900 text-white border-agri-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'yield' ? 'bg-agri-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm">Yield Prediction</h4>
            <p className={`text-xs ${activeTab === 'yield' ? 'text-agri-200' : 'text-slate-500'}`}>Volume & Harvest Forecast</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('fertilizer')}
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            activeTab === 'fertilizer'
              ? 'bg-agri-900 text-white border-agri-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'fertilizer' ? 'bg-agri-700 text-white' : 'bg-amber-50 text-amber-700'}`}>
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm">Fertilizer Advisory</h4>
            <p className={`text-xs ${activeTab === 'fertilizer' ? 'text-agri-200' : 'text-slate-500'}`}>Nutrient Gap & Dosage</p>
          </div>
        </button>
      </div>

      {/* Agronomic / Meteorological Anomaly Warning */}
      {anomalyError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-in fade-in shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-900">Agronomic & Meteorological Input Exception</h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">{anomalyError}</p>
          </div>
          <button
            onClick={() => setAnomalyError(null)}
            className="text-xs font-bold text-amber-700 hover:text-amber-950 px-2.5 py-1 bg-amber-100/80 hover:bg-amber-200/80 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: CROP RECOMMENDATION */}
      {activeTab === 'crop' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Input Soil & Environmental Parameters</h3>
            <form onSubmit={handleRecommendCrop} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nitrogen (N)</label>
                  <input
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Phosphorus (P)</label>
                  <input
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Potassium (K)</label>
                  <input
                    type="number"
                    value={potassium}
                    onChange={(e) => setPotassium(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pH}
                    onChange={(e) => setPH(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Temperature (°C)</label>
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Humidity (%)</label>
                  <input
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Rainfall (mm)</label>
                  <input
                    type="number"
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCropLoading}
                className="w-full py-3 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {isCropLoading ? 'Evaluating Model...' : 'Generate Crop Recommendation'}
              </button>
            </form>
          </div>

          {/* Results Display */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-agri-400">Model Output</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-4">Ranked Crop Suitability Results</h3>

              {cropResults ? (
                <div className="space-y-4">
                  {cropResults.map((res, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-base text-white">
                          {idx + 1}. {res.crop}
                        </span>
                        <span className="text-xs font-black px-2.5 py-1 bg-agri-500 text-white rounded-full">
                          {res.confidence}% Probability
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{res.suitabilityReason}</p>
                      <span className="inline-block text-[11px] font-bold text-agri-300">
                        Expected Yield: {res.expectedYield}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl my-8">
                  <Sprout className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">Adjust soil & weather parameters and click "Generate Recommendation".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: YIELD PREDICTION */}
      {activeTab === 'yield' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Field & Crop Harvest Predictor Inputs</h3>
            <form onSubmit={handlePredictYield} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Crop</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold"
                >
                  <option value="Tomato (Roma VF)">Tomato (Roma VF)</option>
                  <option value="Durum Wheat">Durum Wheat</option>
                  <option value="Potato (Yukon Gold)">Potato (Yukon Gold)</option>
                  <option value="Maize (Sweet Corn)">Maize (Sweet Corn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Field Sector Area (Hectares)</label>
                <input
                  type="number"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isYieldLoading}
                className="w-full py-3 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {isYieldLoading ? 'Calculating Forecast...' : 'Run Yield Prediction Model'}
              </button>
            </form>
          </div>

          {/* Yield Output */}
          <div className="bg-emerald-950 text-white rounded-3xl p-6 border border-emerald-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">ML Forecast Model</span>
              <h3 className="text-xl font-extrabold mt-1 mb-6">Predicted Harvest Volume</h3>

              {yieldResult ? (
                <div className="space-y-6">
                  <div className="p-6 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs">
                    <span className="text-xs text-emerald-300 font-bold uppercase block">Predicted Yield Rate</span>
                    <span className="text-4xl font-black text-white block mt-1">
                      {yieldResult.predictedYieldPerHectare} tons / hectare
                    </span>
                  </div>

                  <div className="p-6 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs">
                    <span className="text-xs text-emerald-300 font-bold uppercase block">Estimated Total Harvest</span>
                    <span className="text-4xl font-black text-emerald-400 block mt-1">
                      {yieldResult.totalHarvestTons} Metric Tons
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase block">Model Influencing Factors:</span>
                    {yieldResult.influencingFactors.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-emerald-300 border border-dashed border-emerald-800 rounded-2xl my-8">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs">Configure target crop and field size to predict harvest yield.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FERTILIZER ADVISORY */}
      {activeTab === 'fertilizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Nutrient Gap Calculation Inputs</h3>
            <form onSubmit={handleGetFertilizer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Crop</label>
                <input
                  type="text"
                  value={fertCrop}
                  onChange={(e) => setFertCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Current N</label>
                  <input
                    type="number"
                    value={fertN}
                    onChange={(e) => setFertN(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Current P</label>
                  <input
                    type="number"
                    value={fertP}
                    onChange={(e) => setFertP(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Current K</label>
                  <input
                    type="number"
                    value={fertK}
                    onChange={(e) => setFertK(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isFertLoading}
                className="w-full py-3 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                {isFertLoading ? 'Analyzing Soil Gap...' : 'Calculate Fertilizer Dosage'}
              </button>
            </form>
          </div>

          {/* Fertilizer Output */}
          <div className="bg-amber-950 text-white rounded-3xl p-6 border border-amber-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Agronomic Prescription</span>
              <h3 className="text-xl font-extrabold mt-1 mb-4">Recommended Fertilizer Application</h3>

              {fertResult ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <span className="text-amber-300 font-bold uppercase block text-[10px]">Nutrient Gap Deficit</span>
                    <p className="text-white font-extrabold text-sm mt-1">
                      N Deficit: {fertResult.nutrientGap.nitrogen} mg/kg | P Deficit: {fertResult.nutrientGap.phosphorus} mg/kg
                    </p>
                  </div>

                  <div className="p-4 bg-amber-500/20 rounded-2xl border border-amber-500/40">
                    <span className="text-amber-200 font-bold uppercase block text-[10px]">Recommended Blend</span>
                    <p className="text-white font-black text-base mt-1">{fertResult.recommendedFertilizer}</p>
                    <p className="text-amber-100 font-semibold mt-1">Dosage: {fertResult.recommendedDosage}</p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <span className="text-amber-300 font-bold uppercase block text-[10px]">Application Timing</span>
                    <p className="text-slate-200 mt-1">{fertResult.recommendedTiming}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-amber-300 border border-dashed border-amber-800 rounded-2xl my-8">
                  <FlaskConical className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-xs">Enter soil sample NPK to compute exact fertilizer application rates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
