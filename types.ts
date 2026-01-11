
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  location?: string;
}

export interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  clicks: number;
  active: boolean;
}

export interface FarmerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  location: string;
  cropType: string;
  sensorStatus: 'online' | 'offline';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  joinedDate: string;
}

export interface SoilData {
  n: number;
  p: number;
  k: number;
  ph: number;
  moisture: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilType?: string;
  organicMatter?: number;
}

export interface PredictionResult {
  crop: string;
  confidence: number;
  description: string;
  plantingSeason: string;
  yieldEstimate: string;
  sustainabilityScore: number;
  nutrientRecommendation: string;
  visualAnalysis?: string;
}

export interface MarketRate {
  commodity: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ViewType = 'dashboard' | 'predictor' | 'market' | 'admin' | 'chat';
