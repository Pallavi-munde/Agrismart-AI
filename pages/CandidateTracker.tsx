
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  MoreVertical,
  Activity,
  ChevronRight
} from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { CandidatePerformance, RecruitmentStage } from '../types';

const STAGE_MAP: Record<RecruitmentStage, { percent: number; label: string; color: string; hex: string }> = {
  'RESUME': { percent: 15, label: 'Resume', color: 'bg-blue-500', hex: '#3b82f6' },
  'APTITUDE': { percent: 30, label: 'Aptitude', color: 'bg-indigo-500', hex: '#6366f1' },
  'TECHNICAL_1': { percent: 50, label: 'Tech I', color: 'bg-violet-500', hex: '#8b5cf6' },
  'TECHNICAL_2': { percent: 70, label: 'Tech II', color: 'bg-purple-500', hex: '#a855f7' },
  'HACKATHON': { percent: 90, label: 'Hackathon', color: 'bg-pink-500', hex: '#ec4899' },
  'HIRED': { percent: 100, label: 'Hired', color: 'bg-emerald-500', hex: '#10b981' }
};

const CandidateTracker: React.FC = () => {
  const [candidates] = useState<CandidatePerformance[]>(MOCK_CANDIDATES);
  const [searchTerm, setSearchTerm] = useState('');

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(candidates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "TalentFlow_Candidates_Export.xlsx");
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search candidates by name, role or email..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all text-sm">
            <Filter size={18} />
            Filters
          </button>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all text-sm"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Candidate info</th>
                <th className="px-6 py-5">Pipeline Progress</th>
                <th className="px-6 py-5 text-center">Inclusion Health</th>
                <th className="px-6 py-5 text-center">Score Avg.</th>
                <th className="px-6 py-5">Hackathon</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCandidates.map((c) => {
                const stageInfo = STAGE_MAP[c.currentStage];
                const avgScore = Math.round((c.resumeScore + c.aptitudeScore + c.techScore1 + c.techScore2) / 4);

                return (
                  <tr key={c.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm border-2 border-white shadow-sm">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 leading-tight">{c.name}</div>
                          <div className="text-xs font-bold text-indigo-600">{c.role}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 min-w-[280px]">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${c.currentStage === 'HIRED' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            {stageInfo.label}
                          </span>
                          <span className="text-[10px] font-black text-slate-300 uppercase">{stageInfo.percent}% COMPLETE</span>
                        </div>
                        
                        {/* Enhanced Continuous Progress Bar */}
                        <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-visible">
                          {/* Active Fill */}
                          <div 
                            className={`absolute h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${c.currentStage === 'HIRED' ? 'from-emerald-400 to-emerald-600' : 'from-indigo-400 to-indigo-600 shadow-sm shadow-indigo-100'}`}
                            style={{ width: `${stageInfo.percent}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-indigo-600 rounded-full shadow-sm scale-125 animate-pulse" />
                          </div>

                          {/* Stage Checkpoints */}
                          {Object.values(STAGE_MAP).map((s, i) => (
                            <div 
                              key={i}
                              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors z-10"
                              style={{ 
                                left: `${s.percent}%`,
                                backgroundColor: stageInfo.percent >= s.percent ? 'white' : '#e2e8f0',
                                border: stageInfo.percent >= s.percent ? `1px solid ${s.hex}` : 'none'
                              }}
                              title={s.label}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 text-center">
                      {c.isFlagged ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase border border-rose-100">
                          <ShieldAlert size={12} />
                          Bias Flag
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                          <CheckCircle2 size={12} />
                          Verified
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-6 text-center">
                      <div className={`text-lg font-black ${avgScore >= 85 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {avgScore}%
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Performance</div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                          {c.hackathonProject || 'Pending...'}
                        </div>
                        {c.hackathonRank > 0 && (
                          <div className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-black">
                            RANK #{c.hackathonRank}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                          <ExternalLink size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
          <Activity className="mb-4 opacity-50" size={24} />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Total Applicants</p>
          <h4 className="text-3xl font-black">1,429</h4>
          <div className="mt-2 text-[10px] font-bold bg-white/20 inline-block px-2 py-1 rounded">+12% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Qualified leads</p>
          <h4 className="text-3xl font-black text-slate-900">42</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-2">3% conversion rate</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Awaiting Review</p>
          <h4 className="text-3xl font-black text-slate-900">12</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Avg. wait: 4.2 hours</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-4">
            <XCircle size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Rejected Roles</p>
          <h4 className="text-3xl font-black text-slate-900">156</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-2">AI-filtered out</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateTracker;
