
import React, { useState, useRef } from 'react';
import { Upload, Search, User, ShieldCheck, Zap, Info, Camera, Image as ImageIcon } from 'lucide-react';
import { parseResume, matchJob, analyzeImageResume } from '../services/geminiService';
import { MOCK_JOBS } from '../constants';

const CandidateMatcher: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!resumeText) return;
    setIsProcessing(true);
    try {
      const resumeData = await parseResume(resumeText);
      setExtractedSkills(resumeData.skills);
      const matchPromises = MOCK_JOBS.map(job => 
        matchJob(resumeData.skills, job.description).then(res => ({ ...res, job }))
      );
      const allResults = await Promise.all(matchPromises);
      setResults(allResults.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
      console.error(error);
      alert("Error processing matching logic.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const data = await analyzeImageResume(base64, file.type);
        setExtractedSkills(data.skills || []);
        setResumeText(`Extracted from image: ${data.experience || ''}`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Upload className="text-indigo-600" size={24} />
              Resume Analysis
            </h3>
            <p className="text-slate-500">Paste text or upload a scan for AI processing.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
            >
              <ImageIcon size={16} />
              Scan Photo
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
        
        <div className="relative">
          <textarea
            className="w-full h-48 p-4 rounded-3xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 bg-slate-50 font-medium"
            placeholder="Paste raw resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <button
            onClick={handleProcess}
            disabled={isProcessing || !resumeText}
            className={`absolute bottom-4 right-4 flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all ${
              isProcessing 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95'
            }`}
          >
            {isProcessing ? 'Thinking...' : 'Match Skills'}
            {!isProcessing && <Zap size={18} />}
          </button>
        </div>

        {extractedSkills.length > 0 && (
          <div className="mt-6 animate-in slide-in-from-top duration-300">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Extracted Skills Profile</h4>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold px-4">AI Ranking Results</h3>

        {results.length === 0 && !isProcessing && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            <User className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Ready for input.</p>
          </div>
        )}

        {results.map((result, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                    <circle cx="56" cy="56" r="48" fill="transparent" stroke="#4f46e5" strokeWidth="8" 
                      strokeDasharray={`${(result.matchScore / 100) * 301} 301`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-2xl font-black text-slate-900">{result.matchScore}%</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Similarity</span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{result.job.title}</h4>
                    <p className="text-slate-500 font-bold">{result.job.company} • {result.job.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Strengths (Matched)</h5>
                    <div className="flex flex-wrap gap-1">
                      {result.matchedSkills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-white text-emerald-700 rounded-lg text-xs font-bold shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                    <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Skill Gaps</h5>
                    <div className="flex flex-wrap gap-1">
                      {result.missingSkills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-white text-rose-700 rounded-lg text-xs font-bold shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                  <Info className="text-indigo-400 shrink-0" size={18} />
                  <p className="text-sm text-slate-600 font-medium italic">
                    "{result.briefAnalysis}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CandidateMatcher;
