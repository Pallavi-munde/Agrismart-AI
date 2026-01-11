
import React, { useState, useRef } from 'react';
import { SoilData, PredictionResult } from '../../types';
import { getCropRecommendation } from '../../services/geminiService';

interface PredictorProps { initialData: SoilData; }

const CropPredictor: React.FC<PredictorProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<SoilData>({
    ...initialData,
    soilType: 'Loamy',
    organicMatter: 2.5
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Remove data URL prefix if image exists
      const base64 = selectedImage ? selectedImage.split(',')[1] : undefined;
      const prediction = await getCropRecommendation(formData, base64);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError('AI service unavailable. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) : value 
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pop">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-50">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Full-System Scan</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Data-driven field insights</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedImage ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fa-solid fa-camera"></i>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        
        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {['n', 'p', 'k', 'ph', 'temperature', 'organicMatter'].map((field) => (
              <div key={field} className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">
                  {field === 'ph' ? 'Soil pH' : field === 'organicMatter' ? 'Organic Matter %' : field.toUpperCase()}
                </label>
                <input 
                  type="number" step={field === 'ph' || field === 'organicMatter' ? '0.1' : '1'} name={field} 
                  value={(formData as any)[field]} onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-black text-slate-700"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Soil Architecture</label>
              <select 
                name="soilType" value={formData.soilType} onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-black text-slate-700 uppercase"
              >
                <option value="Loamy">Loamy (Balanced)</option>
                <option value="Sandy">Sandy (Well-Drained)</option>
                <option value="Clayey">Clayey (Nutrient-Rich)</option>
                <option value="Silty">Silty (Water-Retentive)</option>
              </select>
            </div>
          </div>
          
          {selectedImage && (
            <div className="relative h-24 rounded-2xl overflow-hidden border border-emerald-100 animate-pop">
              <img src={selectedImage} alt="Field preview" className="w-full h-full object-cover" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center shadow-lg"><i className="fa-solid fa-xmark"></i></button>
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-900/60 backdrop-blur-sm p-1 text-[8px] text-white font-black text-center uppercase tracking-widest">Visual Asset Loaded</div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-sparkles"></i>}
            Generate Predictive Dossier
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[500px] relative overflow-hidden">
        {loading && <div className="scanner-line"></div>}
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-4xl shadow-inner relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
              <i className="fa-solid fa-dna"></i>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-black uppercase tracking-widest text-sm animate-pulse">Running ML Models...</p>
              <p className="text-slate-400 text-[10px] font-bold mt-2 italic tracking-tight">Cross-referencing {formData.soilType} profiles with Gemini 3 Neural Engine</p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6 animate-pop">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-emerald-200 animate-sprout">
                <i className="fa-solid fa-seedling"></i>
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none">{result.crop}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black px-3 py-1 bg-emerald-500 text-white rounded-full uppercase tracking-widest">High Match</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(result.confidence * 100).toFixed(0)}% Precision</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Optimum Window</p>
                <p className="text-slate-800 font-black text-base tracking-tight uppercase">{result.plantingSeason}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Expected Yield</p>
                <p className="text-slate-800 font-black text-base tracking-tight uppercase">{result.yieldEstimate}</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 col-span-2 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1">Sustainability Score</p>
                  <p className="text-emerald-900 font-black text-2xl tracking-tighter uppercase">{result.sustainabilityScore}/10</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <i className="fa-solid fa-leaf"></i>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative pl-6 py-1">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ML Intelligence Report</h4>
                <p className="text-slate-600 text-xs leading-relaxed font-medium italic">"{result.description}"</p>
              </div>

              {result.visualAnalysis && (
                <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><i className="fa-solid fa-eye text-4xl"></i></div>
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Visual Diagnostic</h4>
                  <p className="text-xs leading-relaxed font-medium opacity-80">{result.visualAnalysis}</p>
                </div>
              )}

              <div className="bg-emerald-600/10 p-6 rounded-3xl border border-emerald-100">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Actionable Amendments</h4>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">{result.nutrientRecommendation}</p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 shadow-xl transition-all active:scale-95">
                Download PDF
              </button>
              <button onClick={() => setResult(null)} className="flex-1 py-4 border-2 border-slate-100 text-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95">
                New Analysis
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
               <i className="fa-solid fa-satellite-dish text-7xl text-slate-200 group-hover:scale-110 transition-transform duration-700"></i>
               <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Initialize Logic</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-xs mx-auto">Upload soil telemetry or scan your field to start the neural recommendation sequence.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropPredictor;
