
import React, { useState, useEffect } from 'react';
import { SoilData, AdBanner } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CHART_DATA, INITIAL_ADS } from '../../constants';

interface DashboardProps {
  soilData: SoilData;
}

const SensorCard: React.FC<{ label: string, value: string | number, unit: string, icon: string, color: string }> = ({ label, value, unit, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-500 animate-pulse-glow`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-800 tracking-tighter">{value}</span>
          <span className="text-xs text-slate-400 font-bold">{unit}</span>
        </div>
      </div>
    </div>
    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${Math.min(100, (Number(value) / 100) * 100)}%` }}
        />
    </div>
  </div>
);

const FarmerDashboard: React.FC<DashboardProps> = ({ soilData }) => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const savedAds = localStorage.getItem('agri_ads');
    if (savedAds) {
      setAds(JSON.parse(savedAds).filter((ad: AdBanner) => ad.active));
    } else {
      setAds(INITIAL_ADS);
      localStorage.setItem('agri_ads', JSON.stringify(INITIAL_ADS));
    }
  }, []);

  // Auto-sliding Carousel logic
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads]);

  const handleAdClick = (ad: AdBanner) => {
    const allAds = JSON.parse(localStorage.getItem('agri_ads') || '[]');
    const updatedAds = allAds.map((a: AdBanner) => 
      a.id === ad.id ? { ...a, clicks: a.clicks + 1 } : a
    );
    localStorage.setItem('agri_ads', JSON.stringify(updatedAds));
    window.open(ad.targetUrl, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-pop">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard label="Nitrogen" value={soilData.n} unit="mg/kg" icon="fa-n" color="bg-blue-100 text-blue-600" />
        <SensorCard label="Phosphorus" value={soilData.p} unit="mg/kg" icon="fa-p" color="bg-orange-100 text-orange-600" />
        <SensorCard label="Potassium" value={soilData.k} unit="mg/kg" icon="fa-k" color="bg-purple-100 text-purple-600" />
        <SensorCard label="Soil pH" value={soilData.ph.toFixed(1)} unit="pH" icon="fa-vial" color="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group transition-all">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Ecosystem Trends</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Simulated 7-Day Forecast</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></span> Rainfall</span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><span className="w-2 h-2 rounded-full bg-orange-400 shadow-lg shadow-orange-200"></span> Temperature</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="rain" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRain)" />
                <Area type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-950 rounded-[2rem] p-8 text-white flex flex-col justify-between overflow-hidden relative min-h-[350px] shadow-2xl group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 animate-pulse">
              <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
            </div>
            <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase">AI Outlook</h3>
            <p className="text-emerald-100/70 text-sm leading-relaxed mb-8 font-medium italic">
              "Your field shows high potential for sustainable rotation. The upcoming weather windows suggest nitrogen-fixing legumes would thrive in Plot C."
            </p>
          </div>
          <button className="relative z-10 bg-emerald-500 text-emerald-950 font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-white active:scale-95 transition-all shadow-xl shadow-emerald-950/20">
            Analyze Season Cycle
          </button>
        </div>
      </div>

      {ads.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Marketplace Partners</h3>
            <div className="flex gap-1">
              {ads.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${currentAdIndex === i ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
          
          <div className="relative h-48 sm:h-64 rounded-[2.5rem] overflow-hidden group shadow-xl transition-all">
            {ads.map((ad, idx) => (
              <div 
                key={ad.id}
                onClick={() => handleAdClick(ad)}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out cursor-pointer ${
                  idx === currentAdIndex ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-105 pointer-events-none'
                }`}
              >
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-10000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Featured Offer</span>
                    <h4 className="text-white font-black text-2xl sm:text-4xl tracking-tighter uppercase">{ad.title}</h4>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-colors">
                    Explore Now
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider">Live Monitoring Feed</h3>
        <div className="space-y-4">
          {[
            { id: 1, type: 'warning', msg: 'Critical: Plot B Nitrogen levels dropped below 30mg/kg.', time: '2h ago', icon: 'fa-droplet' },
            { id: 2, type: 'info', msg: 'Soil temperature normalized for midday cycle.', time: '5h ago', icon: 'fa-temperature-low' }
          ].map((alert, i) => (
            <div key={alert.id} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 animate-pop" style={{animationDelay: `${i * 100}ms`}}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${
                alert.type === 'warning' ? 'bg-rose-100 text-rose-600 shadow-rose-100' : 'bg-blue-100 text-blue-600 shadow-blue-100'
              }`}>
                <i className={`fa-solid ${alert.icon} text-xl`}></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 tracking-tight leading-snug">{alert.msg}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{alert.time}</p>
              </div>
              <button className="text-slate-300 hover:text-emerald-500 transition-colors">
                <i className="fa-solid fa-circle-check text-xl"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
