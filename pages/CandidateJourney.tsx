
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Rocket, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  Mic,
  Volume2,
  StopCircle
} from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { speakText, transcribeSpeech } from '../services/geminiService';

const CandidateJourney: React.FC = () => {
  const navigate = useNavigate();
  const candidate = MOCK_CANDIDATES[0];
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const stages = [
    { id: 'RESUME', label: 'Resume Match', status: 'done', score: candidate.resumeScore },
    { id: 'APTITUDE', label: 'Aptitude Test', status: 'done', score: candidate.aptitudeScore },
    { id: 'TECHNICAL_1', label: 'Tech Round 1', status: 'done', score: candidate.techScore1 },
    { id: 'TECHNICAL_2', label: 'Tech Round 2', status: 'done', score: candidate.techScore2 },
    { id: 'HACKATHON', label: '24h Hackathon', status: 'active', score: null }
  ];

  const toggleAssistant = () => {
    speakText(`Hello ${candidate.name.split(' ')[0]}. You are currently at the final stage of your application for the ${candidate.role} position. Your 24-hour hackathon challenge starts tomorrow. Would you like to practice a technical interview response now?`);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const text = await transcribeSpeech(base64);
        setTranscription(text || 'Transcription failed.');
      };
      reader.readAsDataURL(blob);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              Live Recruitment
            </div>
            <h2 className="text-4xl font-black">Welcome back, {candidate.name.split(' ')[0]}!</h2>
            <p className="text-slate-400 text-lg">You are in the top 5% of candidates for <span className="text-white font-bold">{candidate.role}</span>.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={toggleAssistant}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              title="Speak with AI Assistant"
            >
              <Volume2 size={24} />
            </button>
            <button 
              onClick={() => navigate('/assessment')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-indigo-900/40"
            >
              Enter Assessment Center
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>

      {/* Voice Prep Section */}
      <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mic className="text-indigo-600" size={24} />
            Voice Interview Practice
          </h3>
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white'
            }`}
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            {isRecording ? 'Stop Recording' : 'Start Practice'}
          </button>
        </div>
        
        {transcription && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Transcription</p>
            <p className="text-slate-700 italic">"{transcription}"</p>
            <p className="text-[10px] text-indigo-500 font-bold mt-4">AI FEEDBACK: Good clarity. Focus more on quantitative results in your next attempt.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage, i) => (
          <div key={i} className={`p-6 rounded-2xl border transition-all ${
            stage.status === 'done' ? 'bg-white border-emerald-100' :
            stage.status === 'active' ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-50 ring-2 ring-indigo-500' :
            'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stage.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                stage.status === 'active' ? 'bg-indigo-600 text-white animate-pulse' :
                'bg-slate-100 text-slate-400'
              }`}>
                {stage.status === 'done' ? <CheckCircle2 size={24} /> : i + 1}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{stage.label}</p>
                <h4 className="font-bold text-slate-900">{stage.score ? `${stage.score}%` : '---'}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateJourney;
