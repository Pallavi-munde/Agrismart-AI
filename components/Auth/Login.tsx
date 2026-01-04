
import React, { useState } from 'react';
import { User, FarmerRecord } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulated Authentication
    setTimeout(() => {
      if (email === 'admin@agri.com' && password === 'admin123') {
        const admin: User = { id: 'admin-1', name: 'System Admin', email: 'admin@agri.com', role: 'admin', status: 'APPROVED' };
        localStorage.setItem('agri_user', JSON.stringify(admin));
        onLogin(admin);
      } else if (email === 'farmer@agri.com' && password === 'farmer123') {
        const farmer: User = { id: 'farmer-1', name: 'Harpreet Singh', email: 'farmer@agri.com', role: 'farmer', location: 'Punjab', status: 'APPROVED' };
        localStorage.setItem('agri_user', JSON.stringify(farmer));
        onLogin(farmer);
      } else {
        // Check local storage for registered pending users
        const savedFarmers: FarmerRecord[] = JSON.parse(localStorage.getItem('agri_farmers') || '[]');
        const found = savedFarmers.find(f => f.email === email);
        
        // Check user-defined password from registration or default 'farmer123' for initial mocks
        const expectedPassword = found?.password || 'farmer123';

        if (found && password === expectedPassword) {
           if (found.status === 'BANNED') {
             setError('This account has been banned for policy violations.');
           } else {
             const userObj: User = { id: found.id, name: found.name, email: found.email, role: 'farmer', location: found.location, status: found.status };
             localStorage.setItem('agri_user', JSON.stringify(userObj));
             onLogin(userObj);
           }
        } else {
          setError('Invalid credentials. Hint: admin@agri.com / admin123 or register a new account.');
        }
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-400/5 rounded-full blur-[100px]"></div>

      <div className={`w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 transition-all duration-700 delay-100 ${error ? 'animate-shake' : ''}`}>
        <div className="bg-emerald-800 p-10 text-center text-white relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paddy.png')] opacity-10"></div>
          <div className="w-16 h-16 bg-emerald-400 rounded-[1.25rem] mx-auto flex items-center justify-center text-emerald-900 text-3xl mb-4 shadow-xl animate-pop">
            <i className="fa-solid fa-leaf"></i>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">AgriSmart AI</h1>
          <p className="text-emerald-300/80 text-xs font-bold uppercase tracking-widest mt-2">Precision Agriculture Platform</p>
        </div>

        <div className="p-8 md:p-10 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-emerald-600 transition-colors">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"></i>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-emerald-600 transition-colors">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"></i>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3 animate-pop">
                <i className="fa-solid fa-circle-exclamation text-base"></i>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
              ) : (
                <>
                  <span>Unlock Access</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Don't have an account? <span onClick={onSwitchToRegister} className="text-emerald-600 font-bold cursor-pointer hover:underline">Apply for membership</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
