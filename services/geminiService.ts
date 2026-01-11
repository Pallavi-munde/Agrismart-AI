
import { GoogleGenAI, Type } from "@google/genai";
import { SoilData, PredictionResult } from "../types";

export const SHARED_SYSTEM_INSTRUCTION = `You are a high-speed AI Agronomist expert. 
CRITICAL RULES:
1. ANSWERS MUST BE SHORT (Maximum 1-2 sentences).
2. Directly answer with precision.
3. No conversational pleasantries (e.g., skip "Hello", "Sure thing").
4. Focus only on actionable agricultural advice.`;

export async function getCropRecommendation(data: SoilData, imageBase64?: string): Promise<PredictionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const textPart = {
    text: `Predict best crop and provide soil health analysis for: 
    N:${data.n}, P:${data.p}, K:${data.k}, pH:${data.ph}, 
    Moisture:${data.moisture}%, Temp:${data.temperature}C, 
    Soil Type: ${data.soilType || 'unknown'}, 
    Organic Matter: ${data.organicMatter || 'unknown'}%.
    ${imageBase64 ? "Also analyze the attached field/soil image for visible deficiencies or texture." : ""}`
  };

  const contents = imageBase64 
    ? { parts: [textPart, { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }] }
    : textPart.text;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: {
      systemInstruction: SHARED_SYSTEM_INSTRUCTION + "\nProvide a detailed agricultural report in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          crop: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          plantingSeason: { type: Type.STRING },
          yieldEstimate: { type: Type.STRING },
          sustainabilityScore: { type: Type.NUMBER },
          nutrientRecommendation: { type: Type.STRING },
          visualAnalysis: { type: Type.STRING, description: "Analysis of the image if provided, otherwise brief soil texture prediction." }
        },
        required: ["crop", "confidence", "description", "plantingSeason", "yieldEstimate", "sustainabilityScore", "nutrientRecommendation"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to receive a valid response from the recommendation engine.");
  }

  return JSON.parse(response.text);
}

export async function agriculturalChat(message: string, history: { role: 'user' | 'assistant', content: string }[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
