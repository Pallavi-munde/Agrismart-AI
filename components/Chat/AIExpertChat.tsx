
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { agriculturalChat, SHARED_SYSTEM_INSTRUCTION } from '../../services/geminiService';
import { ChatMessage } from '../../types';

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const AIExpertChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Systems online. I am your AI Agronomist interface. How can I help you optimize your yields today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API Refs
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopVoiceSession();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await agriculturalChat(userMessage, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Communication failure. Gemini uplink interrupted. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceSession = async () => {
    try {
      setIsVoiceActive(true);
      setVoiceTranscription('Connecting to neural link...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inCtx, output: outCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setVoiceTranscription('Listening to farm intel...');
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setVoiceTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).trim());
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.turnComplete) {
              // Optionally add voice transcription to history
            }
          },
          onerror: (e) => console.error('Voice Error:', e),
          onclose: () => stopVoiceSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SHARED_SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          outputAudioTranscription: {},
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsVoiceActive(false);
      alert('Microphone access or neural link failed.');
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceActive(false);
    setVoiceTranscription('');
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    audioContextsRef.current.input?.close();
    audioContextsRef.current.output?.close();
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-pop relative">
      
      {/* Voice Overlay */}
      {isVoiceActive && (
        <div className="absolute inset-0 z-50 glass bg-emerald-950/90 flex flex-col items-center justify-center p-8 animate-pop">
          <div className="w-full max-w-md text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="w-32 h-32 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white text-5xl relative z-10 shadow-2xl shadow-emerald-500/50">
                <i className="fa-solid fa-microphone-lines animate-bounce"></i>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-emerald-400 font-black tracking-widest uppercase text-lg">Neural Voice Mode</h3>
              <div className="h-24 bg-white/5 rounded-2xl p-4 overflow-y-auto border border-white/10 no-scrollbar">
                <p className="text-emerald-100/70 text-sm font-medium italic leading-relaxed">
                  {voiceTranscription || 'Speak now...'}
                </p>
              </div>
            </div>
            <button 
              onClick={stopVoiceSession}
              className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-400 transition-all shadow-xl shadow-rose-900/40 active:scale-95"
            >
              End Consultation
            </button>
          </div>
        </div>
      )}

      <div className="p-6 border-b bg-emerald-950 text-white flex items-center justify-between relative">
        <div className="absolute inset-0 bg-emerald-400/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <i className="fa-solid fa-robot text-2xl"></i>
          </div>
          <div>
            <h3 className="font-black tracking-tight text-lg uppercase">Agronomist AI</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Neural Link Stable</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={startVoiceSession}
            className="w-10 h-10 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all flex items-center justify-center text-emerald-400"
            title="Start Voice Chat"
          >
            <i className="fa-solid fa-microphone"></i>
          </button>
          <button className="w-10 h-10 hover:bg-emerald-900 rounded-xl transition-all flex items-center justify-center text-emerald-300">
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop`} style={{animationDelay: '100ms'}}>
            <div className={`max-w-[85%] p-5 rounded-[1.75rem] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-pop">
            <div className="bg-white border border-slate-100 p-5 rounded-[1.75rem] rounded-tl-none text-slate-400 flex gap-1.5 items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:200ms]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:400ms]"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
        <button 
          type="button"
          onClick={startVoiceSession}
          className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
        >
          <i className="fa-solid fa-microphone-lines"></i>
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Consult with AI Agronomist..." 
          className="flex-1 px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 shadow-xl shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50 group"
        >
          <i className="fa-solid fa-paper-plane text-xl group-hover:rotate-12 transition-transform"></i>
        </button>
      </form>
    </div>
  );
};

export default AIExpertChat;
