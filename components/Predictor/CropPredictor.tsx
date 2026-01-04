
import React, { useState } from 'react';
import { SoilData, PredictionResult } from '../../types';
import { getCropRecommendation } from '../../services/geminiService';

interface PredictorProps { initialData: SoilData; }

const CropPredictor: React.FC<PredictorProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<SoilData>(initialData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const prediction = await getCropRecommendation(formData);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError('AI service unavailable. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pop">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-50">
            <i className="fa-solid fa-microchip"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Soil Telemetry</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Input values for prediction</p>
          </div>
        </div>
        
        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {['n', 'p', 'k', 'ph', 'temperature', 'rainfall'].map((field) => (
              <div key={field} className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">
                  {field === 'ph' ? 'Soil pH' : field.toUpperCase()}
                </label>
                <div className="relative">
                  <input 
                    type="number" step={field === 'ph' ? '0.1' : '1'} name={field} 
                    value={(formData as any)[field]} onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-black text-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-sparkles"></i>}
            Analyze Patterns
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[500px] relative overflow-hidden">
        {loading && <div className="scanner-line"></div>}
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-4xl shadow-inner relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
              <i className="fa-solid fa-brain"></i>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-black uppercase tracking-widest text-sm animate-pulse">Computing Matrix...</p>
              <p className="text-slate-400 text-[10px] font-bold mt-2 italic">Gemini is evaluating ${formData.ph} pH environmental vectors</p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-8 animate-pop">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-emerald-200 animate-sprout">
                <i className="fa-solid fa-seedling"></i>
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none">{result.crop}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black px-3 py-1 bg-emerald-500 text-white rounded-full uppercase tracking-widest">Master Match</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(result.confidence * 100).toFixed(0)}% Precision</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-transform hover:scale-105">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Optimum Window</p>
                <p className="text-slate-800 font-black text-lg tracking-tight uppercase">{result.plantingSeason}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-transform hover:scale-105">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Yield Potential</p>
                <p className="text-slate-800 font-black text-lg tracking-tight uppercase">{result.yieldEstimate}</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-full"></div>
              <div className="pl-6 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">AI Intelligence Summary</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                  "{result.description}"
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 shadow-xl transition-all active:scale-95">
                Generate Dossier
              </button>
              <button className="flex-1 py-5 border-2 border-slate-100 text-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95">
                Share Network
              </button>
            </div>
          </div>
        ) : error ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-10 animate-pop">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-6"><i className="fa-solid fa-circle-exclamation"></i></div>
            <p className="text-slate-800 font-black uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-full aspect-square bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-200 relative group overflow-hidden">
               <i className="fa-solid fa-cloud-bolt text-7xl text-slate-200 group-hover:scale-110 transition-transform duration-700"></i>
               <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Initialize Logic</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-xs mx-auto">Upload soil telemetry to start the neural recommendation sequence.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropPredictor;
