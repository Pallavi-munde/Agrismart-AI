
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Existing functions updated with specific models
export const parseResume = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest', // Fast response
    contents: `Extract skills and professional experience from the following resume text. 
    Return a list of skills. Resume: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          experienceYears: { type: Type.NUMBER },
          summary: { type: Type.STRING }
        },
        required: ["skills", "experienceYears"]
      }
    }
  });
  return JSON.parse(response.text);
};

// Analyze Image Resume
export const analyzeImageResume = async (base64Data: string, mimeType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // High quality image understanding
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Extract all professional information from this resume image. Identify skills, experience, and contact info if available." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

// Thinking Mode for Complex Job Strategy - Enhanced to return refined text only
export const refineJobDescription = async (draft: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a senior technical recruiter and DE&I expert. Rewrite the following job description to be more inclusive, professional, and attractive to high-performing talent. Eliminate aggressive or biased language. Return ONLY the final refined job description text without any preamble or summary. 
    
    Draft: ${draft}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 } // Max reasoning for high quality rewrite
    }
  });
  return response.text;
};

// Search Grounding for Market Trends
export const getLiveMarketData = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Get the latest 2024/2025 hiring trends, average salaries, and in-demand skills for: ${query}`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// TTS for Candidate Assistant
export const speakText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }
};

// Audio Transcription
export const transcribeSpeech = async (base64Audio: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
        { text: "Transcribe this interview response accurately." }
      ]
    }
  });
  return response.text;
};

// Audio Decoding helper
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

export const analyzeBias = async (jobText: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest', // Fast check
    contents: `Analyze bias and return JSON: ${jobText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          masculineCoded: { type: Type.ARRAY, items: { type: Type.STRING } },
          feminineCoded: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const matchJob = async (resumeSkills: string[], jobDescription: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Match user skills with job. User Skills: ${resumeSkills.join(', ')} Job: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          briefAnalysis: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
