
import { GoogleGenAI, Type } from "@google/genai";
import { SoilData, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SHARED_SYSTEM_INSTRUCTION = `You are a high-speed AI Agronomist expert. 
CRITICAL RULES:
1. ANSWERS MUST BE SHORT (Maximum 1-2 sentences).
2. Directly answer with precision.
3. No conversational pleasantries (e.g., skip "Hello", "Sure thing").
4. Focus only on actionable agricultural advice.`;

export async function getCropRecommendation(data: SoilData): Promise<PredictionResult> {
  const prompt = `Predict best crop for: N:${data.n}, P:${data.p}, K:${data.k}, pH:${data.ph}, ${data.moisture}% moist, ${data.temperature}C.`;

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
