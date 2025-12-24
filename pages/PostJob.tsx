
import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  BrainCircuit, 
  MapPin, 
  Building2, 
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { refineJobDescription, analyzeBias } from '../services/geminiService';

const PostJob: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    skills: ''
  });
  const [isRefining, setIsRefining] = useState(false);
  const [biasReport, setBiasReport] = useState<any>(null);
  const [isCheckingBias, setIsCheckingBias] = useState(false);
  const [showRefinedBadge, setShowRefinedBadge] = useState(false);

  const handleRefine = async () => {
    if (!formData.description) return;
    setIsRefining(true);
    setShowRefinedBadge(false);
    try {
      const refined = await refineJobDescription(formData.description);
      if (refined) {
        setFormData(prev => ({ ...prev, description: refined.trim() }));
        setShowRefinedBadge(true);
        setTimeout(() => setShowRefinedBadge(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert("AI Refinement failed. Please check your API configuration.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleBiasCheck = async () => {
    if (!formData.description) return;
    setIsCheckingBias(true);
    try {
      const report = await analyzeBias(formData.description);
      setBiasReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingBias(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Post New Role</h2>
            <p className="text-slate-500 font-medium">Create ethical, skill-based job descriptions.</p>
          </div>
          <button 
            onClick={handleBiasCheck}
            disabled={isCheckingBias || !formData.description}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            {isCheckingBias ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                Run Bias Audit
                <Sparkles size={16} />
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-[0.1em]">Job Title</label>
              <div className="relative">
                <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Senior Product Designer"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-[0.1em]">Company</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Company Name"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-[0.1em]">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="City, State or Remote"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.1em]">Job Description</label>
                {showRefinedBadge && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded animate-in fade-in slide-in-from-left duration-300">
                    <CheckCircle size={10} />
                    AI REFINED
                  </span>
                )}
              </div>
              <button 
                onClick={handleRefine}
                disabled={isRefining || !formData.description}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all border ${
                  isRefining 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-md shadow-indigo-100'
                }`}
              >
                {isRefining ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing & Rewriting...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={14} />
                    Optimize with AI
                  </>
                )}
              </button>
            </div>
            <div className="relative group">
              <textarea 
                rows={12}
                placeholder="Outline the responsibilities, required experience, and team culture..."
                className={`w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium text-slate-700 leading-relaxed ${isRefining ? 'opacity-50' : ''}`}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              {isRefining && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-3xl">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-indigo-600 animate-spin" />
                    <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Generating Quality Draft</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-[0.1em]">Required Skills (Comma separated)</label>
            <input 
              type="text" 
              placeholder="React, TypeScript, SQL, Agile..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              Post Job Profile
            </button>
            <button className="px-8 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
              Save Draft
            </button>
          </div>
        </div>
      </div>

      {biasReport && (
        <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-xl animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Inclusion Audit Intelligence</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                <p className="text-xs font-black uppercase text-rose-600 tracking-widest mb-3">Linguistic Biases Detected</p>
                <div className="flex flex-wrap gap-2">
                  {biasReport.masculineCoded.length > 0 ? (
                    biasReport.masculineCoded.map((w: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-lg text-sm font-bold text-rose-700 shadow-sm border border-rose-100">{w}</span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-slate-500 italic">No significant biases found.</span>
                  )}
                </div>
              </div>
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <p className="text-xs font-black uppercase text-indigo-600 tracking-widest mb-3">Expert Recommendations</p>
                <ul className="space-y-3">
                  {biasReport.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-sm font-medium text-slate-700 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-50/30 rounded-3xl p-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="76" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                  <circle cx="88" cy="88" r="76" fill="transparent" 
                    stroke={biasReport.score > 80 ? '#10b981' : biasReport.score > 50 ? '#f59e0b' : '#f43f5e'} 
                    strokeWidth="14" 
                    strokeDasharray={`${(biasReport.score / 100) * 477} 477`} strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black text-slate-900 leading-none">{biasReport.score}%</span>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Diversity Score</p>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-6 text-center max-w-[200px]">
                Higher scores indicate neutral, inclusive language that welcomes all demographics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob;
