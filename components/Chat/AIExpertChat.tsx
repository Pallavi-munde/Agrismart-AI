
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { agriculturalChat, SHARED_SYSTEM_INSTRUCTION } from '../../services/geminiService';
import { ChatMessage } from '../../types';

// Manual Base64 Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

const AIExpertChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Neural link active. Ask anything for a quick agronomist report.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API State
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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
      setMessages(prev => [...prev, { role: 'assistant', content: "Uplink error. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceSession = async () => {
    try {
      setIsVoiceActive(true);
      setVoiceTranscription('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inCtx, output: outCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setVoiceTranscription('Listening...');
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
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
              setVoiceTranscription(message.serverContent.outputTranscription.text);
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
          },
          onerror: (e) => console.error(e),
          onclose: () => stopVoiceSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SHARED_SYSTEM_INSTRUCTION,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsVoiceActive(false);
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceActive(false);
    setVoiceTranscription('');
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close?.());
      sessionPromiseRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    audioContextsRef.current.input?.close();
    audioContextsRef.current.output?.close();
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-pop relative">
      {isVoiceActive && (
        <div className="absolute inset-0 z-50 glass bg-emerald-950/95 flex flex-col items-center justify-center p-8 animate-pop">
          <div className="text-center space-y-8 w-full max-w-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/30 blur-3xl animate-pulse"></div>
              <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white text-4xl shadow-2xl relative z-10">
                <i className="fa-solid fa-microphone-lines animate-bounce"></i>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-emerald-400 font-black uppercase tracking-widest text-sm">Voice Link Active</h3>
              <p className="text-white/60 text-xs italic min-h-[1.5rem]">{voiceTranscription || 'Speak clearly...'}</p>
            </div>
            <button onClick={stopVoiceSession} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-400 shadow-xl shadow-rose-900/40">
              End Voice Consultation
            </button>
          </div>
        </div>
      )}

      <div className="p-6 border-b bg-emerald-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight">AI Agronomist</h3>
            <p className="text-[10px] text-emerald-500 font-black uppercase">Rapid Response Mode</p>
          </div>
        </div>
        <button onClick={startVoiceSession} className="w-10 h-10 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-400 transition-all flex items-center justify-center">
          <i className="fa-solid fa-microphone"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
              msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-400 flex gap-1 animate-pulse">
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
        <button type="button" onClick={startVoiceSession} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all"><i className="fa-solid fa-microphone"></i></button>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a quick question..." className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium" />
        <button type="submit" disabled={isLoading || !input.trim()} className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 disabled:opacity-50 transition-all"><i className="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  );
};

export default AIExpertChat;
