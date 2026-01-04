
import React from 'react';
import { ViewType, User } from '../../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, user, onLogout }) => {
  const farmerItems = [
    { id: 'dashboard', label: 'My Farm', icon: 'fa-chart-pie' },
    { id: 'predictor', label: 'Crop Predictor', icon: 'fa-seedling' },
    { id: 'market', label: 'Market Trends', icon: 'fa-arrow-trend-up' },
    { id: 'chat', label: 'AI Agronomist', icon: 'fa-robot' },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'admin', label: 'Admin Portal', icon: 'fa-user-shield' },
    { id: 'market', label: 'Market Data', icon: 'fa-arrow-trend-up' },
  ];

  const menuItems = user.role === 'admin' ? adminItems : farmerItems;

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-emerald-950 text-white transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter uppercase">
          <i className="fa-solid fa-leaf text-emerald-400"></i>
          AgriSmart
        </h1>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-emerald-900 text-emerald-300"
        >
          <i className={`fa-solid ${isOpen ? 'fa-chevron-left' : 'fa-bars'}`}></i>
        </button>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-2">
        <div className={`px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/50 ${!isOpen && 'hidden'}`}>Main Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                : 'text-emerald-300/70 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-center text-lg`}></i>
            {isOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 mt-auto space-y-2">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-rose-400 hover:bg-rose-950 hover:text-rose-300`}
        >
          <i className="fa-solid fa-right-from-bracket w-6 text-center text-lg"></i>
          {isOpen && <span className="font-bold text-sm">Sign Out</span>}
        </button>

        {isOpen && (
          <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800/50">
            <p className="text-[10px] text-emerald-500 mb-1 uppercase font-black tracking-widest">Support Hub</p>
            <p className="text-xs text-slate-300 leading-snug">Need help? Chat with our experts 24/7.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
