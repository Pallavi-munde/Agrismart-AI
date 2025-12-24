
import React, { useState } from 'react';
import { TrendingUp, Users, CheckCircle, AlertCircle, Search, ExternalLink, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MARKET_TRENDS_DATA, MOCK_JOBS } from '../constants';
import { getLiveMarketData } from '../services/geminiService';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketIntel, setMarketIntel] = useState<any>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);

  const fetchIntel = async () => {
    if (!searchQuery) return;
    setIsLoadingIntel(true);
    try {
      const data = await getLiveMarketData(searchQuery);
      setMarketIntel(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingIntel(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Jobs Scraped" value="1,248" icon={TrendingUp} trend={12.5} color="bg-indigo-600" />
        <StatCard title="Active Matches" value="84" icon={Users} trend={5.2} color="bg-violet-600" />
        <StatCard title="Inclusion Score" value="92/100" icon={CheckCircle} color="bg-emerald-600" />
        <StatCard title="Flagged Biases" value="12" icon={AlertCircle} trend={-18.4} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Top In-Demand Skills</h3>
            {/* 
              Fix: Recharts ResponsiveContainer often struggles with '100%' height inside dynamic layouts.
              Using a numeric height and minWidth/minHeight of 0 ensures it doesn't try to calculate 
              negative or unitless dimensions before the DOM is ready.
            */}
            <div className="w-full h-auto min-h-[300px] flex flex-col">
              <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                <BarChart data={MARKET_TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="demand" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-400" size={24} />
                <h3 className="text-2xl font-black">Live Market Intelligence</h3>
              </div>
              <p className="text-indigo-200 mb-6 max-w-md">Query the latest 2025 hiring data using Google Search Grounding.</p>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. AI Engineer salaries in London"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all text-white placeholder:text-indigo-400"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchIntel()}
                  />
                </div>
                <button 
                  onClick={fetchIntel}
                  disabled={isLoadingIntel}
                  className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black hover:bg-indigo-50 transition-all disabled:opacity-50 whitespace-nowrap shadow-lg"
                >
                  {isLoadingIntel ? 'Searching...' : 'Search'}
                </button>
              </div>

              {marketIntel && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-indigo-50 leading-relaxed text-sm">
                    {marketIntel.text}
                  </div>
                  {marketIntel.sources.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {marketIntel.sources.map((chunk: any, i: number) => (
                        chunk.web?.uri && (
                          <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md">
                            <ExternalLink size={10} />
                            {chunk.web.title || 'Source'}
                          </a>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <TrendingUp size={300} className="absolute right-[-100px] bottom-[-100px] text-white opacity-5 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Recent Ethical Insights</h3>
          <div className="space-y-4">
            {MOCK_JOBS.map((job) => (
              <div key={job.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                  job.biasScore > 80 ? 'bg-emerald-500' : job.biasScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {job.biasScore}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{job.title}</h4>
                  <p className="text-sm text-slate-500 truncate">{job.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-400">Match</p>
                  <p className="text-sm font-bold text-indigo-600">High</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
