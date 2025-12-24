
import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Info, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import { analyzeBias } from '../services/geminiService';

const EthicalInsights: React.FC = () => {
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!jobText) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeBias(jobText);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Ethical Guardrails Engine</h2>
          <p className="text-indigo-100 max-w-xl">
            Detect hidden linguistic biases in your job descriptions. We use Gemini 3's advanced reasoning to flag "masculine" or "feminine" coded words that might alienate talent.
          </p>
        </div>
        <ShieldAlert className="absolute right-[-20px] top-[-20px] text-indigo-500 opacity-20" size={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" />
              Analyze Job Description
            </h3>
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
              placeholder="Paste your job description here for an inclusion audit..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobText}
              className="mt-4 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>Analyzing Linguistics...</>
              ) : (
                <><Sparkles size={18} /> Run Inclusive Audit</>
              )}
            </button>
          </div>

          {analysis && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Linguistic Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Masculine Coded
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.masculineCoded.map((word: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-sm text-slate-700">{word}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-indigo-500" />
                    Feminine Coded
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.feminineCoded.map((word: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-sm text-slate-700">{word}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {analysis ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-bold mb-6">Inclusion Score</h3>
              <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mb-6 ${
                analysis.score > 80 ? 'border-emerald-500 text-emerald-600' : 
                analysis.score > 50 ? 'border-amber-500 text-amber-600' : 'border-rose-500 text-rose-600'
              }`}>
                <span className="text-3xl font-black">{analysis.score}%</span>
              </div>
              <div className="w-full space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommendations</h4>
                {analysis.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center">
              <Info className="text-slate-300 mb-4" size={40} />
              <p className="text-slate-500 text-sm italic">Audit results will appear here after analysis.</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold mb-3 text-slate-800">Why does this matter?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Research shows that words like "rockstar," "competitive," and "aggressive" can discourage female applicants, while overly collaborative language might sometimes hide the technical rigor required. EthosMatch helps you find the perfect balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EthicalInsights;
