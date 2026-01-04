
import React, { useState, useEffect, useMemo } from 'react';
import { AdBanner, FarmerRecord } from '../../types';
import { INITIAL_ADS, INITIAL_FARMERS } from '../../constants';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'queue' | 'users' | 'ads' | 'research'>('stats');
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [newAd, setNewAd] = useState({ title: '', imageUrl: '', targetUrl: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', location: '', cropType: 'Wheat' });

  useEffect(() => {
    const savedAds = localStorage.getItem('agri_ads');
    if (savedAds) setAds(JSON.parse(savedAds));
    else setAds(INITIAL_ADS);

    const savedFarmers = localStorage.getItem('agri_farmers');
    if (savedFarmers) setFarmers(JSON.parse(savedFarmers));
    else setFarmers(INITIAL_FARMERS);
  }, []);

  const saveFarmers = (updatedFarmers: FarmerRecord[]) => {
    setFarmers(updatedFarmers);
    localStorage.setItem('agri_farmers', JSON.stringify(updatedFarmers));
  };

  const saveAds = (updatedAds: AdBanner[]) => {
    setAds(updatedAds);
    localStorage.setItem('agri_ads', JSON.stringify(updatedAds));
  };

  const updateFarmerStatus = (id: string, status: FarmerRecord['status']) => {
    saveFarmers(farmers.map(f => f.id === id ? { ...f, status } : f));
  };

  const deleteFarmer = (id: string) => {
    if (window.confirm('Erase this farmer record? This action is permanent.')) {
      saveFarmers(farmers.filter(f => f.id !== id));
    }
  };

  const handleAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    const f: FarmerRecord = {
      id: `f-${Date.now()}`,
      ...newUser,
      sensorStatus: 'online',
      status: 'APPROVED',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    saveFarmers([...farmers, f]);
    setIsAddingUser(false);
    setNewUser({ name: '', email: '', location: '', cropType: 'Wheat' });
  };

  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    const ad: AdBanner = {
      id: `ad-${Date.now()}`,
      ...newAd,
      clicks: 0,
      active: true
    };
    saveAds([...ads, ad]);
    setNewAd({ title: '', imageUrl: '', targetUrl: '' });
  };

  const toggleAdStatus = (id: string) => {
    saveAds(ads.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad));
  };

  const deleteAd = (id: string) => {
    if (window.confirm('Erase this marketing campaign?')) {
      saveAds(ads.filter(ad => ad.id !== id));
    }
  };

  const pendingFarmers = useMemo(() => farmers.filter(f => f.status === 'PENDING'), [farmers]);
  const approvedFarmers = useMemo(() => farmers.filter(f => f.status !== 'PENDING'), [farmers]);

  const stats = [
    { label: 'Active Farmers', value: approvedFarmers.length.toString(), change: '+12%', icon: 'fa-users', color: 'bg-blue-600' },
    { label: 'Pending Apps', value: pendingFarmers.length.toString(), change: 'New', icon: 'fa-clock', color: 'bg-amber-500' },
    { label: 'Network Reach', value: '45,210', change: '+5%', icon: 'fa-tower-broadcast', color: 'bg-emerald-600' },
    { label: 'Ad Performance', value: `${ads.reduce((acc, curr) => acc + curr.clicks, 0)} clks`, change: '+18%', icon: 'fa-bolt', color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-pop">
      <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap gap-2">
        {[
          { id: 'stats', label: 'Main Control', icon: 'fa-chart-simple' },
          { id: 'queue', label: 'Approval Queue', icon: 'fa-user-clock' },
          { id: 'users', label: 'Farmer Registry', icon: 'fa-user-group' },
          { id: 'ads', label: 'Ads Manager', icon: 'fa-bullhorn' },
          { id: 'research', label: 'Data Vault', icon: 'fa-vault' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300 relative ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-[1.02]' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-sm`}></i>
            <span className="block">{tab.label}</span>
            {tab.id === 'queue' && pendingFarmers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {pendingFarmers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="transition-all duration-500">
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-pop">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                      <i className={`fa-solid ${stat.icon}`}></i>
                    </div>
                    <span className="text-emerald-500 text-[10px] font-black tracking-widest bg-emerald-50 px-3 py-1 rounded-full uppercase">{stat.change}</span>
                  </div>
                  <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h4>
                  <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Network Telemetry</h3>
              </div>
              <div className="aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl relative">
                <img src="https://picsum.photos/seed/agriglobal/1200/600" alt="Heatmap" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                   <h4 className="text-white text-3xl font-black tracking-tighter uppercase mb-2">Cluster Precision Index</h4>
                   <p className="text-slate-300 text-sm font-medium">Real-time aggregate from {approvedFarmers.length} active farmers across 12 zones.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6 animate-pop">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pending Applications</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{pendingFarmers.length} Requests Found</p>
            </div>
            
            {pendingFarmers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingFarmers.map((f, i) => (
                  <div key={f.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-pop flex flex-col justify-between" style={{animationDelay: `${i * 100}ms`}}>
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-xl border border-amber-100">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg tracking-tight leading-none mb-1">{f.name}</p>
                          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{f.location}</p>
                        </div>
                      </div>
                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Email:</span>
                          <span className="text-slate-700 font-black">{f.email}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Crop:</span>
                          <span className="text-emerald-600 font-black">{f.cropType}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Applied:</span>
                          <span className="text-slate-700 font-black">{f.joinedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => updateFarmerStatus(f.id, 'APPROVED')}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg active:scale-95 transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateFarmerStatus(f.id, 'REJECTED')}
                        className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-32 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                <i className="fa-solid fa-check-double text-7xl mb-6 opacity-20"></i>
                <p className="font-black uppercase tracking-widest text-sm">All requests processed</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-pop">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">System Registry</h3>
              <button 
                onClick={() => setIsAddingUser(true)}
                className="px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-plus mr-2"></i> Deploy User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedFarmers.map((farmer, i) => (
                    <tr key={farmer.id} className="hover:bg-slate-50 transition-colors animate-pop" style={{animationDelay: `${i * 50}ms`}}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${
                            farmer.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {farmer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 tracking-tight">{farmer.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{farmer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest ${
                          farmer.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                          farmer.status === 'BANNED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {farmer.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 font-black uppercase tracking-wider">{farmer.location}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateFarmerStatus(farmer.id, farmer.status === 'BANNED' ? 'APPROVED' : 'BANNED')}
                            className={`w-10 h-10 rounded-xl transition-all active:scale-90 flex items-center justify-center ${
                              farmer.status === 'BANNED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                            title={farmer.status === 'BANNED' ? 'Unban User' : 'Ban User'}
                          >
                            <i className={`fa-solid ${farmer.status === 'BANNED' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
                          </button>
                          <button 
                            onClick={() => deleteFarmer(farmer.id)}
                            className="w-10 h-10 hover:bg-rose-50 rounded-xl text-rose-400 transition-all active:scale-90 flex items-center justify-center border border-rose-100"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal-like overlay for adding user */}
        {isAddingUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-pop">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-sprout">
               <div className="bg-emerald-950 p-8 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Register New Node</h3>
                 <button onClick={() => setIsAddingUser(false)} className="text-emerald-400 hover:text-white"><i className="fa-solid fa-xmark text-2xl"></i></button>
               </div>
               <form onSubmit={handleAddFarmer} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Farmer Name</label>
                       <input 
                         type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                       />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                       <input 
                         type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Region</label>
                       <input 
                         type="text" required value={newUser.location} onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Crop</label>
                       <select 
                         value={newUser.cropType} onChange={(e) => setNewUser({...newUser, cropType: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                       >
                         <option>Wheat</option><option>Rice</option><option>Corn</option><option>Cotton</option>
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all">
                    Authorize Entry
                 </button>
               </form>
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pop">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-28">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Campaign Creator</h3>
                <form onSubmit={handleAddAd} className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Campaign Headline</label>
                    <input 
                      type="text" 
                      value={newAd.title}
                      onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                      placeholder="Enter catchphrase"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Asset URL</label>
                    <input 
                      type="url" 
                      value={newAd.imageUrl}
                      onChange={(e) => setNewAd({...newAd, imageUrl: e.target.value})}
                      placeholder="Image link"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                  >
                    Authorize Campaign
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Live Marketplace Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ads.map((ad, i) => (
                  <div key={ad.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group animate-pop" style={{animationDelay: `${i * 100}ms`}}>
                    <div className="relative h-44 overflow-hidden">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl ${ad.active ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-400 text-white'}`}>
                        {ad.active ? 'Live' : 'Halted'}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-slate-800 text-lg tracking-tight mb-2 uppercase">{ad.title}</h4>
                        <div className="flex items-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <span className="flex items-center gap-2"><i className="fa-solid fa-chart-line text-emerald-500"></i> {ad.clicks} Hits</span>
                          <a href={ad.targetUrl} target="_blank" className="text-blue-500 hover:text-blue-700 flex items-center gap-2">Target <i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => toggleAdStatus(ad.id)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                            ad.active ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {ad.active ? 'Pause' : 'Resume'}
                        </button>
                        <button 
                          onClick={() => deleteAd(ad.id)}
                          className="w-12 h-12 border-2 border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90 flex items-center justify-center"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center animate-pop">
            <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-5xl mb-8 relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
              <i className="fa-solid fa-dna relative z-10"></i>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-3">Admin Intel Vault</h3>
            <p className="text-slate-400 font-medium max-w-lg mb-10 leading-relaxed">
              Proprietary soil research, regional nitrogen reports, and local hydrology CSVs. Secure uplink required for decryption.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer transition-all group active:scale-95">
                <i className="fa-solid fa-upload text-3xl text-emerald-500 mb-4 group-hover:-translate-y-2 transition-transform"></i>
                <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Ingest Dataset</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-wide uppercase">XLS / CSV / JSON (MAX 100MB)</p>
              </div>
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:bg-rose-50 hover:border-rose-200 cursor-pointer transition-all group active:scale-95">
                <i className="fa-solid fa-file-shield text-3xl text-rose-500 mb-4 group-hover:-translate-y-2 transition-transform"></i>
                <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Secure Archive</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-wide uppercase">PDF / DOC / PGP (ENCRYPTED)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
