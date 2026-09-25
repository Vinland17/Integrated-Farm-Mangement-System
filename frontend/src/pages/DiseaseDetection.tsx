import React, { useState } from 'react';
import { Scan, UploadCloud, Camera, Image, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { predictionService } from '../services/predictionService';
import { DiseaseDetectionResult } from '../types';
import { useToast } from '../hooks/useToast';

export const DiseaseDetection: React.FC = () => {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) {
      showToast('Select Image', 'Please upload or capture a leaf image scan.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await predictionService.detectDisease(selectedFile || new File([], 'leaf.jpg'));
      setResult(res);
      showToast('Diagnostic Complete', `Detected ${res.diseaseName} with ${res.confidence}% confidence.`, 'success');
    } catch {
      showToast('Scan Error', 'Failed to analyze crop leaf image.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSample = () => {
    const sampleUrl = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb16428?auto=format&fit=crop&w=600&q=80';
    setPreviewUrl(sampleUrl);
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Plant Disease Vision Diagnostic Classifier"
        subtitle="Upload leaf photography for deep learning computer vision pathology classification & advisory."
        icon={<Scan className="w-6 h-6" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image Upload Area */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Upload Crop Leaf Image</h3>
            <p className="text-xs text-slate-500 mb-6">
              Supported formats: JPEG, PNG, WEBP. Ensure leaf lesions are clearly lit and centered.
            </p>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden ${
                previewUrl ? 'border-agri-500 bg-agri-50/30' : 'border-slate-300 hover:border-agri-400 bg-slate-50/50'
              }`}
            >
              {previewUrl ? (
                <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-inner group">
                  <img src={previewUrl} alt="Crop Leaf Scan" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setResult(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-agri-100/80 text-agri-800 rounded-full mb-3 shadow-2xs">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Drag and drop leaf image here</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">or click to browse local files or camera scan</p>

                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-colors">
                      Browse Files
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      onClick={handleUseSample}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Use Sample Leaf
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !previewUrl}
            className="w-full mt-6 py-3.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Executing Neural Vision Model...
              </>
            ) : (
              <>
                <Scan className="w-5 h-5" />
                Analyze Leaf Image
              </>
            )}
          </button>
        </div>

        {/* Right Column: Pathology Result Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-agri-400">Diagnostic Vision Output</span>
              {result && <StatusBadge status={`${result.severity} Risk`} size="sm" />}
            </div>

            {result ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Identified Disease Pathology</span>
                  <h3 className="text-2xl lg:text-3xl font-black text-white">{result.diseaseName}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-extrabold px-3 py-1 bg-agri-500 text-white rounded-full">
                      {result.confidence}% Model Confidence Score
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{result.affectedField}</span>
                  </div>
                </div>

                {/* Top 3 Predictions Breakdown */}
                {result.top_predictions && result.top_predictions.length > 0 && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-2">
                    <strong className="text-white block mb-1">Top Predictions Breakdown:</strong>
                    <div className="space-y-1.5">
                      {result.top_predictions.map((pred, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300">
                          <span className="font-medium text-slate-200">{pred.display_name || pred.disease}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-agri-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, pred.confidence)}%` }}></div>
                            </div>
                            <span className="font-mono text-xs font-bold text-white w-10 text-right">{pred.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs leading-relaxed text-slate-300">
                  <strong className="text-white block mb-1">Pathology Description:</strong>
                  {result.description}
                </div>

                {/* Recommended Action Advisory */}
                <div className="p-5 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase text-xs">
                    <ShieldCheck className="w-4 h-4" /> Agricultural Mitigation Advisory
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug">{result.recommendedAction}</p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl my-12">
                <Image className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <h4 className="font-bold text-sm text-slate-300">No Image Analyzed Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Upload a crop leaf image scan on the left and click "Analyze Leaf Image" to evaluate disease symptoms.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>PyTorch EfficientNet-B0 Vision Backbone</span>
            <span>Dataset: Tomato Disease 10 Classes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
