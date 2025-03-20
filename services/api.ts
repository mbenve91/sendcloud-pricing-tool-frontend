// services/api.ts - Servizio per interagire con l'API backend
import { authService } from './authService';

// URL per il backend su Render
// In produzione, usa sempre l'URL di Render per evitare riferimenti a localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

const API_BASE_URL = isProduction
  ? 'https://sendcloud-pricing-tool-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050');

// Definizione dell'interfaccia WeightRange
export interface WeightRange {
  id: string;
  label: string;
  min: number;
  max: number;
  basePrice: number;
  userDiscount: number;
  finalPrice: number;
  actualMargin: number;
  adjustedMargin?: number;
  volumeDiscount: number;
  promotionDiscount: number;
}

// Funzione di utilità per aggiungere il token di autenticazione agli header
function getAuthHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Funzione di utilità per le chiamate fetch con gestione degli errori
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers as Record<string, string>,
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      // Assicurati che le credenziali non siano inviate per evitare problemi CORS
      credentials: 'omit', 
      // Imposta mode: 'cors' esplicitamente
      mode: 'cors'
    });
    
    if (!response.ok) {
      // Se riceviamo 401, l'utente non è autenticato
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      }
      throw new Error(`Errore nella richiesta API: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Errore nella chiamata API a ${url}:`, error);
    throw error;
  }
}

/**
 * Recupera tutti i corrieri attivi dal backend
 */
export async function getCarriers() {
  try {
    // Usa la funzione di utilità per fare la chiamata API
    const data = await fetchWithErrorHandling(`${API_BASE_URL}/api/carriers`);
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio getCarriers:', error);
    throw error;
  }
}

/**
 * Confronta le tariffe in base ai filtri specificati
 * @param filters - Filtri per la ricerca (peso, tipo destinazione, paese, ecc.)
 */
export async function compareRates(filters: {
  weight: string;
  destinationType: string;
  destinationCountry?: string;
  carrierId?: string;
  serviceType?: string;
  volume?: string;
  sourceCountry?: string;
}) {
  try {
    // Costruisci i parametri di query
    const queryParams = new URLSearchParams();
    
    queryParams.append('weight', filters.weight);
    
    // Mappiamo i tipi di destinazione del frontend a quelli supportati dal backend
    let destinationType = filters.destinationType;
    if (destinationType === 'eu' || destinationType === 'extra_eu') {
      destinationType = 'international';
      // Aggiungiamo un parametro aggiuntivo per distinguere tra EU e Extra EU
      if (filters.destinationType === 'eu') {
        queryParams.append('euType', 'eu');
      } else if (filters.destinationType === 'extra_eu') {
        queryParams.append('euType', 'extra_eu');
      }
    }
    queryParams.append('destinationType', destinationType);
    
    if (filters.destinationCountry) {
      queryParams.append('destinationCountry', filters.destinationCountry);
    }
    
    if (filters.carrierId) {
      queryParams.append('carrier', filters.carrierId);
    }
    
    if (filters.serviceType) {
      queryParams.append('serviceType', filters.serviceType);
    }
    
    // Aggiungi volume se presente
    if (filters.volume) {
      queryParams.append('volume', filters.volume);
    }
    
    // Aggiungi sourceCountry (market) se presente
    if (filters.sourceCountry) {
      queryParams.append('sourceCountry', filters.sourceCountry.toLowerCase());
    }
    
    // Usa la funzione di utilità per fare la chiamata API
    const data = await fetchWithErrorHandling(`${API_URL}/rates/compare?${queryParams.toString()}`);
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio compareRates:', error);
    throw error;
  }
}

/**
 * Recupera i dettagli di una tariffa specifica
 * @param id - ID della tariffa
 */
export async function getRateDetails(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/rates/${id}`);
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio getRateDetails:', error);
    throw error;
  }
}

/**
 * Recupera tutti i servizi o i servizi di un corriere specifico
 * @param carrierId - ID del corriere (opzionale)
 */
export async function getServices(carrierId?: string) {
  try {
    let url = `${API_URL}/services`;
    
    if (carrierId) {
      url = `${API_URL}/services?carrier=${carrierId}`;
    }
    
    const data = await fetchWithErrorHandling(url);
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio getServices:', error);
    throw error;
  }
}

/**
 * Recupera tutte le fasce di peso per un servizio specifico
 * @param serviceId - ID del servizio per cui recuperare le fasce di peso
 * @returns Una lista di fasce di peso con i relativi prezzi
 */
export async function getWeightRangesByService(serviceId: string): Promise<WeightRange[]> {
  try {
    const result = await fetchWithErrorHandling(`${API_URL}/rates/service/${serviceId}/weightRanges`);
    console.log('Risposta API fasce di peso:', result);
    
    // Assicuriamoci di restituire l'array di dati, non l'oggetto di risposta
    return result.data || [];
  } catch (error) {
    console.error('Errore nel servizio getWeightRangesByService:', error);
    throw error;
  }
} 