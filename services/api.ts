// services/api.ts - API service for the frontend
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Carrier {
  _id: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  fuelSurcharge: number;
  isVolumetric: boolean;
}

export interface CarrierInput {
  name: string;
  logoUrl?: string | null;
  isActive?: boolean;
  fuelSurcharge?: number;
  isVolumetric?: boolean;
}

export interface Rate {
  _id: string;
  carrier: Carrier | string;
  serviceName: string;
  serviceCode: string;
  serviceDescription: string;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  destinationType: 'national' | 'international' | 'both';
  destinationCountry: string | null;
  weightMin: number;
  weightMax: number;
  purchasePrice: number;
  retailPrice: number;
  margin: number;
  marginPercentage: number;
}

export interface CompareRatesParams {
  weight: number;
  destinationType?: 'national' | 'international' | 'both';
  destinationCountry?: string;
  minMargin?: number;
}

// API functions
export const apiService = {
  // Carriers
  getCarriers: async (): Promise<Carrier[]> => {
    const response = await apiClient.get('/carriers');
    return response.data.data;
  },

  getCarrier: async (id: string): Promise<Carrier> => {
    const response = await apiClient.get(`/carriers/${id}`);
    return response.data.data;
  },

  createCarrier: async (carrierData: CarrierInput): Promise<Carrier> => {
    const response = await apiClient.post('/carriers', carrierData);
    return response.data.data;
  },

  updateCarrier: async (id: string, carrierData: Partial<CarrierInput>): Promise<Carrier> => {
    const response = await apiClient.put(`/carriers/${id}`, carrierData);
    return response.data.data;
  },

  deleteCarrier: async (id: string): Promise<void> => {
    await apiClient.delete(`/carriers/${id}`);
  },

  // Rates
  getRates: async (): Promise<Rate[]> => {
    const response = await apiClient.get('/rates');
    return response.data.data;
  },

  getRatesByCarrier: async (carrierId: string): Promise<Rate[]> => {
    const response = await apiClient.get(`/rates/carrier/${carrierId}`);
    return response.data.data;
  },

  compareRates: async (params: CompareRatesParams): Promise<Rate[]> => {
    const response = await apiClient.get('/rates/compare', { params });
    return response.data.data;
  },
};

export default apiService;