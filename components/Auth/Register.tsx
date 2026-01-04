
import React, { useState } from 'react';
import { FarmerRecord } from '../../types';
import { INITIAL_FARMERS } from '../../constants';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    cropType: 'Wheat'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    
    // Simulate API registration delay
    setTimeout(() => {
      const newFarmer: FarmerRecord = {
        id: `f-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        location: formData.location,
        cropType: formData.cropType,
        sensorStatus: 'offline',
        status: 'PENDING',
        joinedDate: new Date().toISOString().split('T')[0]
      };

      const existing: FarmerRecord[] = JSON.parse(localStorage.getItem('agri_farmers') || JSON.stringify(INITIAL_FARMERS));
      localStorage.setItem('agri_farmers', JSON.stringify([...existing, newFarmer]));
      
      setIsLoading(false);
      onRegisterSuccess();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-pop">
        <div className="bg-emerald-900 p-10 text-center text-white relative">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Farmer Access</h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-400 scale-125 shadow-[0_0_15px_rgba(52,211,153,0.6)]' : 'bg-emerald-800'}`}></div>
                {s < 2 && <div className={`w-12 h-1 rounded-full transition-all duration-500 ${step > s ? 'bg-emerald-400' : 'bg-emerald-800'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-pop">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Identity: Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm"
                    placeholder="E.g. Harpreet Singh"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Contact: Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm"
                    placeholder="farmer@example.com"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Secure: Password</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-pop">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Operation: Region Name</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm"
                    placeholder="e.g. Ludhiana, Punjab"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Strategy: Primary Crop</label>
                  <select 
                    value={formData.cropType}
                    onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-black text-sm uppercase tracking-wider"
                  >
                    <option>Wheat</option>
                    <option>Rice</option>
                    <option>Corn</option>
                    <option>Cotton</option>
                    <option>Sugarcane</option>
                  </select>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                    <i className="fa-solid fa-circle-info mr-2"></i>
                    Your application will be reviewed for sensor network integration.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95"
                >
                  Back
                </button>
              )}
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <span>{step === 2 ? 'Submit Application' : 'Continue'}</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Already a member? <span onClick={onSwitchToLogin} className="text-emerald-600 cursor-pointer hover:underline font-bold">Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
