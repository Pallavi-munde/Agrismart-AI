
import { GoogleGenAI, Type } from "@google/genai";
import { MarketRate, GroundingSource } from "../types";

const CACHE_KEY = "agrismart_market_data";
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData {
  rates: MarketRate[];
  sources: GroundingSource[];
  rawSummary: string;
  timestamp: number;
}

/**
 * Fetches live market data using Gemini Search Grounding.
 * Implements a 1-hour caching mechanism to optimize performance and reduce API usage.
 */
export async function fetchLiveMarketData(): Promise<{ rates: MarketRate[], sources: GroundingSource[], rawSummary: string }> {
  // 1. Check Cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsedCache: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRY;
      
      if (!isExpired && parsedCache.rates && parsedCache.rates.length > 0) {
        console.debug("Returning cached market data");
        return {
          rates: parsedCache.rates,
          sources: parsedCache.sources,
          rawSummary: parsedCache.rawSummary
        };
      }
    } catch (e) {
      console.warn("Failed to parse market cache, fetching fresh data", e);
      localStorage.removeItem(CACHE_KEY);
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // 2. Search for the latest market rates
    console.debug("Fetching fresh market data via search grounding...");
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find the latest wholesale market prices (Mandi rates) for Wheat, Rice, Corn, Cotton, and Sugarcane in India for the current week. Provide specific prices and locations.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    if (!searchResponse.text) {
      throw new Error("Empty response from search model");
    }

    const rawSummary = searchResponse.text;
    
    // Extract grounding chunks/sources
    const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || 'Market Data Source'
      }));

    // 3. Structure that data into JSON
    console.debug("Structuring search results into JSON format...");
    const structureResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert the following market research text into a clean JSON array of MarketRate objects. 
      Each object should have keys: commodity, market, minPrice, maxPrice, modalPrice, and arrivalDate (YYYY-MM-DD). 
      Ensure prices are numbers. If a specific field is missing, provide a reasonable estimate based on the text.
      
      Text:
      ${rawSummary}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              commodity: { type: Type.STRING },
              market: { type: Type.STRING },
              minPrice: { type: Type.NUMBER },
              maxPrice: { type: Type.NUMBER },
              modalPrice: { type: Type.NUMBER },
              arrivalDate: { type: Type.STRING }
            },
            required: ["commodity", "market", "minPrice", "maxPrice", "modalPrice", "arrivalDate"]
          }
        }
      }
    });

    if (!structureResponse.text) {
      throw new Error("Failed to generate structured JSON from search results");
    }

    let rates: MarketRate[];
    try {
      rates = JSON.parse(structureResponse.text);
    } catch (parseError) {
      console.error("Failed to parse structured market JSON", parseError);
      throw new Error("The model returned malformed market data.");
    }

    // 4. Save to Cache
    const cachePayload: CachedData = {
      rates,
      sources,
      rawSummary,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));

    return { rates, sources, rawSummary };

  } catch (error: any) {
    console.error("Critical error in fetchLiveMarketData:", error);
    
    // Specific error handling for known failure modes
    if (error?.message?.includes("API_KEY")) {
      console.error("Authentication Error: Check your environment API key configuration.");
    }
    
    // Re-throw to let the component handle the fallback UI
    throw error;
  }
}
