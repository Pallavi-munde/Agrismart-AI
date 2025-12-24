
import React, { useState } from 'react';
import { 
  Trophy, 
  Code2, 
  Github, 
  Globe, 
  Send, 
  Sparkles,
  Timer,
  Info,
  ArrowRight,
  Search,
  Filter,
  Medal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { HACKATHON_PROBLEMS, HACKATHON_LEADERBOARD } from '../constants';

const HackathonPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenge' | 'leaderboard'>('challenge');
  const [submission, setSubmission] = useState({ repo: '', demo: '', description: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'rank', direction: 'asc' });

  const problem = HACKATHON_PROBLEMS[0]; // Active problem

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredLeaderboard = [...HACKATHON_LEADERBOARD]
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.project.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      
      if (valA === valB) return 0;
      
      const comparison = valA > valB ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const SortIndicator = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) {
      return (
        <div className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity">
          <ChevronUp size={14} />
        </div>
      );
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-indigo-600 transition-transform" /> 
      : <ChevronDown size={14} className="text-indigo-600 transition-transform" />;
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in slide-in-from-bottom duration-700">
        <div className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-emerald-200 rotate-12">
          <Trophy size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900">Final Stage Submitted!</h2>
          <p className="text-slate-500 text-lg">Your hackathon project is now under review by <span className="font-bold text-indigo-600">{problem.company}</span> engineers.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500 italic">
          "Submission Receipt: #TALENT-{Math.floor(Math.random() * 900000) + 100000}"
        </div>
        <button 
          onClick={() => { setIsSubmitted(false); setActiveTab('leaderboard'); }}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          View Live Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'challenge' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Challenge Brief
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Leaderboard
          </button>
        </div>

        <div className="flex items-center gap-4 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
          <Timer size={18} className="text-amber-600" />
          <span className="text-sm font-black text-slate-900">14:22:04 REMAINING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'challenge' ? (
          <>
            <div className="lg:col-span-2 space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={14} /> LIVE HACKATHON
                    </span>
                    <span className="text-slate-400 text-sm font-medium">Hosted by {problem.company}</span>
                  </div>
                  <h2 className="text-3xl font-black mb-4">{problem.title}</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">{problem.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
                <Code2 size={200} className="absolute right-[-40px] bottom-[-40px] text-white opacity-5" />
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Send className="text-indigo-600" size={24} />
                  Your Submission
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">GitHub Repository URL</label>
                    <div className="relative">
                      <Github size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="https://github.com/username/project"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={submission.repo}
                        onChange={(e) => setSubmission({ ...submission, repo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Live Demo URL (Optional)</label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="https://my-app.vercel.app"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={submission.demo}
                        onChange={(e) => setSubmission({ ...submission, demo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Approach</label>
                    <textarea 
                      placeholder="Explain your architectural choices and how you addressed accessibility/performance..."
                      className="w-full p-4 h-48 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      value={submission.description}
                      onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setIsSubmitted(true)}
                  disabled={!submission.repo || !submission.description}
                  className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 transition-all ${
                    !submission.repo || !submission.description 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'
                  }`}
                >
                  Complete 24h Hackathon
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-indigo-600" />
                  Evaluation Criteria
                </h4>
                <ul className="space-y-4">
                  {[
                    { label: 'Code Quality', weight: '40%' },
                    { label: 'UI/UX Polish', weight: '30%' },
                    { label: 'A11y Compliance', weight: '20%' },
                    { label: 'Creativity', weight: '10%' }
                  ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">{item.label}</span>
                      <span className="text-slate-900 font-bold">{item.weight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Trophy className="text-amber-500" size={28} />
                    Live Ranking
                  </h3>
                  <p className="text-slate-500">Participating talent and real-time project impact scores.</p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search candidates..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200">
                    <Filter size={20} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th 
                        className="px-6 py-5 rounded-l-2xl cursor-pointer group select-none hover:text-indigo-600 transition-colors" 
                        onClick={() => handleSort('rank')}
                        title="Sort by Rank"
                      >
                        <div className="flex items-center gap-2">
                          Rank <SortIndicator column="rank" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-5 cursor-pointer group select-none hover:text-indigo-600 transition-colors" 
                        onClick={() => handleSort('name')}
                        title="Sort by Name"
                      >
                        <div className="flex items-center gap-2">
                          Candidate <SortIndicator column="name" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-5 cursor-pointer group select-none hover:text-indigo-600 transition-colors" 
                        onClick={() => handleSort('project')}
                        title="Sort by Project"
                      >
                        <div className="flex items-center gap-2">
                          Project Title <SortIndicator column="project" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-5 cursor-pointer group select-none hover:text-indigo-600 transition-colors" 
                        onClick={() => handleSort('role')}
                        title="Sort by Role"
                      >
                        <div className="flex items-center gap-2">
                          Role <SortIndicator column="role" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-5 rounded-r-2xl cursor-pointer text-right group select-none hover:text-indigo-600 transition-colors" 
                        onClick={() => handleSort('score')}
                        title="Sort by Score"
                      >
                        <div className="flex items-center justify-end gap-2">
                          Score <SortIndicator column="score" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaderboard.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-lg ${item.rank <= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                              #{item.rank}
                            </span>
                            {item.rank <= 3 && <Medal size={18} className={item.rank === 1 ? 'text-amber-500' : item.rank === 2 ? 'text-slate-400' : 'text-amber-700'} />}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-white shadow-sm">
                              {item.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-bold text-slate-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors">
                            {item.project}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${
                                  item.score >= 90 ? 'bg-emerald-500' : 
                                  item.score >= 80 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${item.score}%` }} 
                              />
                            </div>
                            <span className="font-black text-slate-900 text-base">{item.score}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonPortal;
