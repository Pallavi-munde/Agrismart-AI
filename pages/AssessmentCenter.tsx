
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Timer, 
  Trophy, 
  Code2, 
  Terminal,
  Zap,
  ArrowRight,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ASSESSMENT_QUESTIONS } from '../constants';

const AssessmentCenter: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'IDLE' | 'APTITUDE' | 'TECH' | 'HACKATHON'>('IDLE');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const questions = activeStage === 'APTITUDE' ? ASSESSMENT_QUESTIONS.APTITUDE : ASSESSMENT_QUESTIONS.TECHNICAL;

  useEffect(() => {
    let timer: any;
    if (activeStage !== 'IDLE' && !isCompleted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeStage, isCompleted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correctCount++;
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setIsCompleted(true);
  };

  if (activeStage === 'IDLE') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Assessment Portal</h2>
          <p className="text-slate-500 text-lg">Complete the challenges below to prove your skills and unlock the Hackathon.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'APTITUDE', title: 'Aptitude Test', icon: Timer, time: '25m', questions: 15, status: 'ready', color: 'indigo' },
            { id: 'TECH', title: 'Technical Rd 1', icon: Terminal, time: '45m', questions: 20, status: 'locked', color: 'slate' },
            { id: 'HACKATHON', title: 'Live Hackathon', icon: Trophy, time: '24h', questions: 'Project', status: 'locked', color: 'slate' }
          ].map((card) => (
            <div key={card.id} className={`bg-white p-8 rounded-3xl border ${card.status === 'ready' ? 'border-indigo-100 shadow-xl shadow-indigo-50 ring-1 ring-indigo-500/20' : 'border-slate-100 opacity-60'} flex flex-col items-center text-center transition-all hover:scale-[1.02]`}>
              <div className={`p-4 rounded-2xl mb-6 ${card.status === 'ready' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <card.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h3>
              <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase mb-8">
                <span>{card.time}</span>
                <span>•</span>
                <span>{card.questions} {typeof card.questions === 'number' ? 'Questions' : ''}</span>
              </div>
              {card.status === 'ready' ? (
                <button 
                  onClick={() => setActiveStage(card.id as any)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Start Assessment
                  <ChevronRight size={18} />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
                  Unlock at 70% threshold
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const isPassed = (score || 0) >= 70;
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in fade-in zoom-in duration-300">
        <div className={`inline-flex p-6 rounded-full ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isPassed ? <CheckCircle2 size={64} /> : <AlertCircle size={64} />}
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900">{isPassed ? 'Well Done!' : 'Stage Not Cleared'}</h2>
          <p className="text-slate-500 mt-2">You scored <span className="text-indigo-600 font-black text-xl">{score}%</span> in the {activeStage} module.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-400">
            <span>Minimum Requirement</span>
            <span>70%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }}></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => { setActiveStage('IDLE'); setIsCompleted(false); setScore(null); }}
            className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Return to Dashboard
          </button>
          {isPassed && (
            <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700">
              Next Stage: Technical
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            {activeStage === 'APTITUDE' ? <Timer size={20} /> : <Terminal size={20} />}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{activeStage} Assessment</h4>
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-mono font-bold">
          <Timer size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <p className="text-2xl font-medium text-slate-800 leading-relaxed">
            {questions[currentQuestion].q}
          </p>

          <div className="grid grid-cols-1 gap-3">
            {questions[currentQuestion].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => setAnswers({ ...answers, [currentQuestion]: i })}
                className={`w-full p-5 rounded-2xl border text-left transition-all font-bold text-lg group flex justify-between items-center ${
                  answers[currentQuestion] === i 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md ring-1 ring-indigo-500' 
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {opt}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                   answers[currentQuestion] === i ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'
                }`}>
                  {answers[currentQuestion] === i && <CheckCircle2 size={14} />}
                </div>
              </button>
            ))}
          </div>

          <button 
            disabled={answers[currentQuestion] === undefined}
            onClick={handleNext}
            className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-2 ${
              answers[currentQuestion] === undefined 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
            <ArrowRight size={20} />
          </button>
        </div>
        <Zap className="absolute bottom-[-30px] right-[-30px] text-slate-50 opacity-50" size={200} />
      </div>
    </div>
  );
};

export default AssessmentCenter;
