
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  UserCheck, 
  ShieldCheck, 
  Settings,
  Briefcase,
  Users,
  Code2,
  FileSpreadsheet,
  UserCircle,
  Map,
  Zap,
  Trophy,
  PlusSquare
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<'recruiter' | 'candidate'>('recruiter');

  useEffect(() => {
    const savedRole = localStorage.getItem('user-role') as any;
    if (savedRole) setRole(savedRole);
  }, []);

  const toggleRole = () => {
    const newRole = role === 'recruiter' ? 'candidate' : 'recruiter';
    setRole(newRole);
    localStorage.setItem('user-role', newRole);
    window.location.href = newRole === 'recruiter' ? '/' : '#/journey';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Briefcase size={20} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            TalentFlow
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          {role === 'recruiter' ? (
            <>
              <SidebarLink to="/" icon={LayoutDashboard} label="Admin Dashboard" active={location.pathname === '/'} />
              <SidebarLink to="/post-job" icon={PlusSquare} label="Post New Job" active={location.pathname === '/post-job'} />
              <SidebarLink to="/tracker" icon={FileSpreadsheet} label="Candidate Tracker" active={location.pathname === '/tracker'} />
              <SidebarLink to="/trends" icon={BarChart3} label="Market Trends" active={location.pathname === '/trends'} />
              <SidebarLink to="/insights" icon={ShieldCheck} label="Ethical Insights" active={location.pathname === '/insights'} />
            </>
          ) : (
            <>
              <SidebarLink to="/journey" icon={Map} label="My Journey" active={location.pathname === '/journey'} />
              <SidebarLink to="/jobs" icon={Briefcase} label="Browse Jobs" active={location.pathname === '/jobs'} />
              <SidebarLink to="/assessment" icon={Zap} label="Assessment Center" active={location.pathname === '/assessment'} />
              <SidebarLink to="/hackathon" icon={Trophy} label="Hackathon Portal" active={location.pathname === '/hackathon'} />
              <SidebarLink to="/matcher" icon={UserCheck} label="Resume Screener" active={location.pathname === '/matcher'} />
            </>
          )}
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <button 
            onClick={toggleRole}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-wider"
          >
            <UserCircle size={16} />
            Switch to {role === 'recruiter' ? 'Candidate' : 'Recruiter'}
          </button>
          <SidebarLink to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 relative">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {role === 'recruiter' ? 'Acquisition Portal' : 'Candidate Portal'}
            </h2>
            <p className="text-slate-500">
              {role === 'recruiter' ? 'Reviewing high-priority talent' : 'Welcome back, Alex Rivera'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 capitalize">{role}</p>
              <p className="text-xs text-indigo-600 font-medium">Verified Account</p>
            </div>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role === 'candidate' ? 'Alex' : 'Boss'}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100" alt="User" />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};
