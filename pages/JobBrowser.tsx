
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Code2, 
  PenTool, 
  Search,
  ArrowRight
} from 'lucide-react';
import { MOCK_JOBS } from '../constants';

const JobBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'tech' | 'non-tech'>('all');

  const filteredJobs = MOCK_JOBS.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'tech') return job.isTech;
    return !job.isTech;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All Roles
          </button>
          <button 
            onClick={() => setFilter('tech')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'tech' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Code2 size={16} className="inline mr-2" />
            Tech
          </button>
          <button 
            onClick={() => setFilter('non-tech')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'non-tech' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <PenTool size={16} className="inline mr-2" />
            Non-Tech
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-indigo-500">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${job.isTech ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {job.isTech ? <Code2 size={24} /> : <PenTool size={24} />}
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                job.biasScore > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {job.biasScore}% Inclusive
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-slate-500 font-medium mb-4 flex items-center gap-1">
              <Briefcase size={14} />
              {job.company} • <MapPin size={14} className="ml-1" /> {job.location}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.extractedSkills.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded uppercase">
                  {skill}
                </span>
              ))}
            </div>

            <button 
              onClick={() => navigate('/matcher')}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all"
            >
              Start AI Screening
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobBrowser;
