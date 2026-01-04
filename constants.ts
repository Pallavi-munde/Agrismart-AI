
import { MarketRate, AdBanner, FarmerRecord } from './types';

export const INITIAL_SOIL_DATA = {
  n: 60,
  p: 45,
  k: 40,
  ph: 6.5,
  moisture: 35,
  temperature: 24,
  humidity: 70,
  rainfall: 150
};

export const MOCK_MARKET_RATES: MarketRate[] = [
  { commodity: 'Wheat', market: 'Mandi A', minPrice: 2100, maxPrice: 2300, modalPrice: 2200, arrivalDate: '2024-05-20' },
  { commodity: 'Rice', market: 'Mandi B', minPrice: 2800, maxPrice: 3200, modalPrice: 3000, arrivalDate: '2024-05-20' },
  { commodity: 'Corn', market: 'Mandi A', minPrice: 1900, maxPrice: 2100, modalPrice: 2000, arrivalDate: '2024-05-19' },
  { commodity: 'Cotton', market: 'Mandi C', minPrice: 6500, maxPrice: 7200, modalPrice: 6900, arrivalDate: '2024-05-20' },
  { commodity: 'Sugarcane', market: 'Mandi B', minPrice: 310, maxPrice: 350, modalPrice: 335, arrivalDate: '2024-05-20' },
];

export const MOCK_CHART_DATA = [
  { name: 'Jan', temp: 20, rain: 45 },
  { name: 'Feb', temp: 22, rain: 30 },
  { name: 'Mar', temp: 25, rain: 20 },
  { name: 'Apr', temp: 30, rain: 15 },
  { name: 'May', temp: 35, rain: 10 },
  { name: 'Jun', temp: 32, rain: 180 },
  { name: 'Jul', temp: 28, rain: 250 },
];

export const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad-1',
    title: 'Premium Organic Fertilizer',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400',
    targetUrl: 'https://example.com/fertilizer',
    clicks: 124,
    active: true
  },
  {
    id: 'ad-2',
    title: 'Modern Irrigation Kits',
    imageUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&q=80&w=400',
    targetUrl: 'https://example.com/irrigation',
    clicks: 89,
    active: true
  }
];

export const INITIAL_FARMERS: FarmerRecord[] = [
  { id: 'f-1', name: 'Harpreet Singh', email: 'harpreet@farm.com', location: 'Punjab', cropType: 'Wheat', sensorStatus: 'online', status: 'APPROVED', joinedDate: '2023-10-15' },
  { id: 'f-2', name: 'Rajesh Kumar', email: 'rajesh@farm.com', location: 'Haryana', cropType: 'Rice', sensorStatus: 'online', status: 'APPROVED', joinedDate: '2023-11-20' },
  { id: 'f-3', name: 'Anjali Sharma', email: 'anjali@farm.com', location: 'UP', cropType: 'Corn', sensorStatus: 'offline', status: 'PENDING', joinedDate: '2024-01-05' },
  { id: 'f-4', name: 'Vijay Das', email: 'vijay@farm.com', location: 'Bihar', cropType: 'Rice', sensorStatus: 'offline', status: 'PENDING', joinedDate: '2024-02-12' },
];
