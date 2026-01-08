
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'E:/ethos/components/Layout';
import Dashboard from 'E:/ethos/pages/Dashboard';
import CandidateMatcher from 'E:/ethos/pages/CandidateMatcher';
import EthicalInsights from 'E:/ethos/pages/EthicalInsights';
import CandidateTracker from 'E:/ethos/pages/CandidateTracker';
import JobBrowser from 'E:/ethos/pages/JobBrowser';
import AssessmentCenter from 'E:/ethos/pages/AssessmentCenter';
import CandidateJourney from 'E:/ethos/pages/CandidateJourney';
import HackathonPortal from 'E:/ethos/pages/HackathonPortal';
import PostJob from 'E:/ethos/pages/PostJob';

const MarketTrends = () => (
  <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
    <h3 className="text-xl font-bold mb-2 text-slate-900">Market Trends Visualization</h3>
    <p className="text-slate-500">Day 14 Sprint Deliverable: Integrating real-time market density maps.</p>
    <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg mx-auto">
      <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300"></div>
      <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300"></div>
      <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300"></div>
      <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300"></div>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <h3 className="text-xl font-bold mb-4">Account Settings</h3>
    <p className="text-slate-500 italic">Configure role-based permissions and matching thresholds.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Recruiter Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/tracker" element={<CandidateTracker />} />
          <Route path="/trends" element={<MarketTrends />} />
          <Route path="/insights" element={<EthicalInsights />} />
          
          {/* Candidate Routes */}
          <Route path="/journey" element={<CandidateJourney />} />
          <Route path="/jobs" element={<JobBrowser />} />
          <Route path="/matcher" element={<CandidateMatcher />} />
          <Route path="/assessment" element={<AssessmentCenter />} />
          <Route path="/hackathon" element={<HackathonPortal />} />
          
          {/* Shared */}
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
