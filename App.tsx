
import React, { useState, useEffect } from 'react';
import { ViewType, SoilData, User } from './types';
import { INITIAL_SOIL_DATA } from './constants';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FarmerDashboard from './components/Dashboard/FarmerDashboard';
import CropPredictor from './components/Predictor/CropPredictor';
import MarketTrends from './components/Market/MarketTrends';
import AdminPanel from './components/Admin/AdminPanel';
import AIExpertChat from './components/Chat/AIExpertChat';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [soilData, setSoilData] = useState<SoilData>(INITIAL_SOIL_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setTimeout(() => {
      setIsLoadingAuth(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'farmer' || user.status !== 'APPROVED') return;

    const interval = setInterval(() => {
      setSoilData(prev => ({
        ...prev,
        moisture: Math.max(0, Math.min(100, prev.moisture + (Math.random() - 0.5) * 2)),
        temperature: Math.max(10, Math.min(45, prev.temperature + (Math.random() - 0.5) * 0.5)),
        humidity: Math.max(20, Math.min(95, prev.humidity + (Math.random() - 0.5) * 1)),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('agri_user');
    setUser(null);
    setAuthView('login');
    setCurrentView('dashboard');
  };

  const renderView = () => {
    if (user?.role === 'farmer' && user?.status === 'PENDING') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-pop">
           <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-5xl relative">
              <div className="absolute inset-0 bg-amber-200/20 rounded-full animate-ping"></div>
              <i className="fa-solid fa-clock-rotate-left relative z-10"></i>
           </div>
           <div className="max-w-md">
             <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Approval In Progress</h2>
             <p className="text-slate-500 font-medium leading-relaxed">
               Welcome to AgriSmart, <strong>{user.name}</strong>. Your account is currently under review by our administrative team. You will have full access once your credentials are verified.
             </p>
           </div>
           <button 
             onClick={handleLogout}
             className="px-8 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
           >
             Sign Out
           </button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <FarmerDashboard soilData={soilData} />;
      case 'predictor':
        return <CropPredictor initialData={soilData} />;
      case 'market':
        return <MarketTrends />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <FarmerDashboard soilData={soilData} />;
      case 'chat':
        return <AIExpertChat />;
      default:
        return <FarmerDashboard soilData={soilData} />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-emerald-950 text-white overflow-hidden">
        <div className="flex flex-col items-center gap-6 relative">
          <div className="absolute inset-0 bg-emerald-400/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-4xl shadow-2xl relative z-10 animate-sprout">
            <i className="fa-solid fa-leaf text-white"></i>
          </div>
          <div className="text-center z-10 space-y-2">
            <h2 className="text-xl font-black tracking-[0.2em] uppercase text-emerald-400">AgriSmart AI</h2>
            <p className="text-xs text-emerald-200/50 font-medium italic">Planting the seeds of data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' 
      ? <Login onLogin={setUser} onSwitchToRegister={() => setAuthView('register')} /> 
      : <Register onRegisterSuccess={() => setAuthView('login')} onSwitchToLogin={() => setAuthView('login')} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header view={currentView} soilData={soilData} user={user} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
        
        <footer className="bg-white border-t py-3 px-6 text-xs text-slate-500 flex justify-between items-center z-10">
          <p>&copy; 2024 AgriSmart AI Systems. All sensor data is simulated.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
              System Online
            </span>
            <span className="flex items-center gap-1 font-bold">
              {user.role.toUpperCase()} MODE
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
