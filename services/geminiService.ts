
import { GoogleGenAI, Type } from "@google/genai";
import { SoilData, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SHARED_SYSTEM_INSTRUCTION = `You are an expert Agronomist. 
CRITICAL: You must give extremely short, concise, and direct answers. 
Limit responses to 1-2 sentences maximum. 
Focus only on high-impact agricultural facts. 
Encouraging but brief.`;

export async function getCropRecommendation(data: SoilData): Promise<PredictionResult> {
  const prompt = `Based on the following data, predict the best crop. Keep descriptions short.
  Data: N:${data.n}, P:${data.p}, K:${data.k}, pH:${data.ph}, Moist:${data.moisture}%, Temp:${data.temperature}C, Rain:${data.rainfall}mm`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SHARED_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          crop: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          plantingSeason: { type: Type.STRING },
          yieldEstimate: { type: Type.STRING }
        },
        required: ["crop", "confidence", "description", "plantingSeason", "yieldEstimate"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function agriculturalChat(message: string, history: { role: 'user' | 'assistant', content: string }[]) {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SHARED_SYSTEM_INSTRUCTION,
    },
  });

  const response = await chat.sendMessage({
    message: message
  });

  return response.text;
}

export { SHARED_SYSTEM_INSTRUCTION };
