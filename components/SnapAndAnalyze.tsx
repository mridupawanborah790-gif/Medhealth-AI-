
import React, { useState, useRef } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { NutritionAnalysis } from '../types';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface SnapAndAnalyzeProps {
  onClose: () => void;
  onLogMeal: (analysis: NutritionAnalysis, imageBase64: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const SnapAndAnalyze: React.FC<SnapAndAnalyzeProps> = ({ onClose, onLogMeal }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setAnalysis(null);
    setIsLoading(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const b64 = await fileToBase64(file);
      setImageBase64(b64);

      const result = await analyzeFoodImage(b64);
      if (!result || !result.items || result.items.length === 0) {
        throw new Error("I couldn't identify any food in this photo. Please try a clearer shot.");
      }
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try a different photo.');
      console.error("Meal Analysis Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogAndClose = () => {
    if (analysis && imageBase64) {
      onLogMeal(analysis, imageBase64);
      onClose();
    }
  };

  const resetCapture = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-100/60 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-[48px] w-full max-w-lg h-auto max-h-[95vh] overflow-y-auto shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] animate-scaleIn border border-white flex flex-col p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/30 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-none">Log Your Meal</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">AI Vision Analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center font-bold text-2xl hover:bg-slate-600 transition-all hover:rotate-90"
          >
            &times;
          </button>
        </div>
        
        <div className="flex-grow space-y-8">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload / Preview Area */}
          {!imagePreview ? (
            <div 
                onClick={triggerSelect}
                className="relative aspect-square w-full rounded-[48px] border-2 border-dashed border-slate-600 bg-gradient-to-br from-emerald-50 via-white to-primary/5 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all group overflow-hidden"
            >
                {/* Visual Lens Corners */}
                <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>

                <div className="bg-white w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-6 relative z-10">
                    <span className="text-4xl animate-bounce">📸</span>
                </div>
                <p className="text-slate-100 font-black text-xl relative z-10">Tap to Scan</p>
                <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-wider relative z-10">Select or capture photo</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="relative aspect-[4/3] w-full rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.15)] border-4 border-white bg-slate-900">
                <img src={imagePreview} alt="Meal" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                {!analysis && isLoading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <Spinner />
                    <p className="mt-4 text-slate-100 font-black text-xl animate-pulse tracking-tight">Decoding your plate...</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] text-center shadow-sm border-l-8 border-l-accent-red animate-slideInUp">
                    <p className="text-accent-red text-sm font-black">{error}</p>
                    <button onClick={resetCapture} className="mt-3 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Pick different angle</button>
                </div>
              )}

              {analysis && (
                <div className="space-y-8 animate-slideInUp">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-primary/10 to-emerald-50 border border-primary/20 p-6 rounded-[32px] text-center shadow-sm">
                        <p className="text-[10px] text-primary-dark font-black uppercase tracking-widest mb-1">Calories</p>
                        <p className="text-5xl font-black text-primary leading-none tracking-tighter">{Math.round(analysis.total.kcal)}</p>
                      </div>
                      <div className="bg-slate-700/50 p-6 rounded-[32px] border border-slate-600 shadow-sm flex flex-col justify-center space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Prot</span>
                            <span className="font-black text-accent-sky text-sm">{Math.round(analysis.total.protein_g)}g</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fat</span>
                            <span className="font-black text-accent-red text-sm">{Math.round(analysis.total.fat_g)}g</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Carb</span>
                            <span className="font-black text-accent-purple text-sm">{Math.round(analysis.total.carb_g)}g</span>
                        </div>
                      </div>
                  </div>

                  {/* Identified Items List */}
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-2 px-2">Identified Contents</h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-hide pr-1">
                      {analysis.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-900 p-4 rounded-[28px] border border-slate-600/50 hover:border-primary/30 transition-all duration-300">
                          <div>
                            <p className="font-black capitalize text-slate-100 text-sm">{item.label}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="bg-white/60 px-2 py-0.5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                    {item.portion_estimate.value} {item.portion_estimate.unit}
                                </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-primary text-sm">{Math.round(item.macros.kcal)} kcal</p>
                            <div className="flex items-center space-x-1.5 mt-1 justify-end">
                                <div className="w-8 h-1 bg-slate-600 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${item.confidence * 100}%` }}></div>
                                </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 pt-2">
                    <button 
                        onClick={resetCapture} 
                        className="flex-1 py-5 bg-slate-700 text-slate-100 font-black uppercase tracking-widest text-[11px] rounded-[24px] hover:bg-slate-600 transition-all"
                    >
                        Retake
                    </button>
                    <button 
                        onClick={handleLogAndClose} 
                        className="flex-1 py-5 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-[24px] shadow-2xl shadow-primary/40 hover:bg-primary-dark transition-all active:scale-95"
                    >
                        Save Meal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
