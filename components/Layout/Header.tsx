
import React from 'react';
import { ViewType, SoilData, User } from '../../types';

interface HeaderProps {
  view: ViewType;
  soilData: SoilData;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ view, soilData, user }) => {
  const getTitle = () => {
    switch (view) {
      case 'dashboard': return user.role === 'admin' ? 'Network Overview' : 'My Farm Analytics';
      case 'predictor': return 'Crop Recommendation Engine';
      case 'market': return 'Live Mandi Prices';
      case 'admin': return 'Administrative Control';
      case 'chat': return 'Expert Consultations';
      default: return 'AgriSmart AI';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">{getTitle()}</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {user.role === 'admin' ? 'Admin Node' : `Sensor Network • ${user.location || 'Unknown'}`}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {user.role === 'farmer' && (
          <div className="hidden lg:flex gap-8 border-r border-slate-100 pr-8">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Temp</p>
              <p className="font-black text-slate-700">{soilData.temperature.toFixed(1)}°C</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Soil Moisture</p>
              <p className="font-black text-emerald-600">{soilData.moisture.toFixed(0)}%</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800">{user.name}</p>
            <p className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {user.role} Member
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${
            user.role === 'admin' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
          }`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
