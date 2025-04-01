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

// Definizione dell'interfaccia Carrier
export interface Carrier {
  _id: string;
  name: string;
  logoUrl: string;
  isActive: boolean;
  fuelSurcharge: number;
  isVolumetric: boolean;
  knowledgeBase?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Definizione dell'interfaccia Service
export interface Service {
  _id: string;
  name: string;
  code: string;
  description?: string;
  carrier: Carrier | string;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  destinationType: 'national' | 'international' | 'both';
  destinationCountry?: string[];
  sourceCountry?: string;
  isEU?: boolean;
  serviceType?: 'normal' | 'return' | 'pudo' | 'locker' | 'other';
  isActive: boolean;
  ratesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Definizione dell'interfaccia Rate
export interface Rate {
  _id: string;
  service: Service | string;
  weightMin: number;
  weightMax: number;
  purchasePrice: number;
  retailPrice: number;
  margin?: number;
  marginPercentage?: number;
  volumeDiscount?: number;
  promotionalDiscount?: number;
  minimumVolume?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Definizione dell'interfaccia per i filtri di confronto tariffe
export interface RateFilters {
  weight: string;
  destinationType: string;
  destinationCountry?: string;
  carrier?: string;
  service?: string;
  carriers?: string[];
  services?: string[];
  countries?: string[];
  volume?: string;
  sourceCountry?: string;
  minMargin?: string;
  maxPrice?: string;
  euType?: string;
  serviceType?: string;
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
    // Propaga l'errore AbortError senza modificarlo
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    
    console.error(`Errore nella chiamata API a ${url}:`, error);
    throw error;
  }
}

// ============= CARRIERS API =============

/**
 * Recupera tutti i corrieri attivi dal backend
 */
export async function getCarriers() {
  try {
    // Usa la funzione di utilità per fare la chiamata API
    const data = await fetchWithErrorHandling(`${API_URL}/carriers`);
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio getCarriers:', error);
    return []; // Restituisci un array vuoto in caso di errore
  }
}

/**
 * Recupera un corriere specifico dal backend
 */
export async function getCarrier(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/carriers/${id}`);
    return data.data;
  } catch (error) {
    console.error(`Errore nel recupero del corriere ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuovo corriere
 */
export async function createCarrier(carrier: Omit<Carrier, '_id'>) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/carriers`, {
      method: 'POST',
      body: JSON.stringify(carrier)
    });
    return data.data;
  } catch (error) {
    console.error('Errore nella creazione del corriere:', error);
    throw error;
  }
}

/**
 * Aggiorna un corriere esistente
 */
export async function updateCarrier(id: string, carrier: Partial<Carrier>) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/carriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carrier)
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento del corriere ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un corriere (soft delete impostando isActive = false)
 */
export async function deleteCarrier(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/carriers/${id}`, {
      method: 'DELETE'
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione del corriere ${id}:`, error);
    throw error;
  }
}

/**
 * Aggiorna il fuel surcharge per più corrieri
 */
export async function updateBulkFuelSurcharge(ids: string[], fuelSurcharge: number) {
  try {
    const promises = ids.map(id => 
      updateCarrier(id, { fuelSurcharge })
    );
    return await Promise.all(promises);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del fuel surcharge per più corrieri:', error);
    throw error;
  }
}

/**
 * Aggiorna lo stato di attività per più corrieri
 */
export async function toggleBulkCarrierStatus(ids: string[], isActive: boolean) {
  try {
    const promises = ids.map(id => 
      updateCarrier(id, { isActive })
    );
    return await Promise.all(promises);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato per più corrieri:', error);
    throw error;
  }
}

// ============= SERVICES API =============

/**
 * Recupera tutti i servizi o i servizi di un corriere specifico
 * @param carrierId - ID del corriere (opzionale)
 */
export async function getServices(carrierId?: string) {
  try {
    let url = `${API_URL}/services`;
    
    if (carrierId && carrierId !== 'all') {
      url = `${API_URL}/services?carrier=${carrierId}`;
    }
    
    const data = await fetchWithErrorHandling(url);
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio getServices:', error);
    return []; // Restituisci un array vuoto in caso di errore
  }
}

/**
 * Recupera un servizio specifico
 */
export async function getService(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/services/${id}`);
    return data.data;
  } catch (error) {
    console.error(`Errore nel recupero del servizio ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuovo servizio
 */
export async function createService(service: Omit<Service, '_id'>) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/services`, {
      method: 'POST',
      body: JSON.stringify(service)
    });
    return data.data;
  } catch (error) {
    console.error('Errore nella creazione del servizio:', error);
    throw error;
  }
}

/**
 * Aggiorna un servizio esistente
 */
export async function updateService(id: string, service: Partial<Service>) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service)
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento del servizio ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un servizio
 */
export async function deleteService(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/services/${id}`, {
      method: 'DELETE'
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione del servizio ${id}:`, error);
    throw error;
  }
}

/**
 * Aggiorna il market (sourceCountry) di un servizio
 */
export async function updateServiceMarket(id: string, sourceCountry: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/services/${id}/market`, {
      method: 'PUT',
      body: JSON.stringify({ sourceCountry })
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento del market per il servizio ${id}:`, error);
    throw error;
  }
}

// ============= RATES API =============

/**
 * Recupera tutte le tariffe o filtra per carrier/service
 */
export async function getRates(filters?: { carrier?: string, service?: string }) {
  try {
    let url = `${API_URL}/rates`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.carrier) params.append('carrier', filters.carrier);
      if (filters.service) params.append('service', filters.service);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const data = await fetchWithErrorHandling(url);
    return data.data;
  } catch (error) {
    console.error('Errore nel recupero delle tariffe:', error);
    return []; // Restituisci un array vuoto in caso di errore
  }
}

/**
 * Recupera una tariffa specifica
 */
export async function getRate(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/rates/${id}`);
    return data.data;
  } catch (error) {
    console.error(`Errore nel recupero della tariffa ${id}:`, error);
    throw error;
  }
}

/**
 * Crea una nuova tariffa
 */
export async function createRate(rate: Omit<Rate, '_id'>) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/rates`, {
      method: 'POST',
      body: JSON.stringify(rate)
    });
    return data.data;
  } catch (error) {
    console.error('Errore nella creazione della tariffa:', error);
    throw error;
  }
}

/**
 * Aggiorna una tariffa esistente
 */
export async function updateRate(id: string, rate: Partial<Rate>) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rate)
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento della tariffa ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina una tariffa
 */
export async function deleteRate(id: string) {
  try {
    const data = await fetchWithErrorHandling(`${API_URL}/rates/${id}`, {
      method: 'DELETE'
    });
    return data.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione della tariffa ${id}:`, error);
    throw error;
  }
}

/**
 * Confronta le tariffe in base ai filtri specificati
 * @param filters - Filtri per la ricerca (peso, tipo destinazione, paese, ecc.)
 * @param signal - AbortSignal opzionale per cancellare la richiesta
 */
export async function compareRates(filters: RateFilters, signal?: AbortSignal) {
  try {
    // Costruisci i parametri di query
    const queryParams = new URLSearchParams();
    
    queryParams.append('weight', filters.weight || '1');
    
    // Mappiamo i tipi di destinazione del frontend a quelli supportati dal backend
    let destinationType = filters.destinationType || 'national';
    if (destinationType === 'eu' || destinationType === 'extra_eu') {
      destinationType = 'international';
      // Aggiungiamo un parametro aggiuntivo per distinguere tra EU e Extra EU
      if (filters.destinationType === 'eu') {
        queryParams.append('euType', 'eu');
      } else if (filters.destinationType === 'extra_eu') {
        queryParams.append('euType', 'extra_eu');
      }
    } else if (filters.euType && filters.euType !== 'all') {
      // Se euType è specificato esplicitamente
      queryParams.append('euType', filters.euType);
    }
    queryParams.append('destinationType', destinationType);
    
    // Gestione parametri multi-select
    // Carrier(s)
    if (Array.isArray(filters.carriers) && filters.carriers.length > 0) {
      queryParams.append('carriers', filters.carriers.join(','));
    } else if (filters.carrier && filters.carrier !== 'all') {
      queryParams.append('carrier', filters.carrier);
    }
    
    // Service(s)
    if (Array.isArray(filters.services) && filters.services.length > 0) {
      queryParams.append('services', filters.services.join(','));
    } else if (filters.service && filters.service !== 'all') {
      queryParams.append('service', filters.service);
    }
    
    // Country/Countries
    if (Array.isArray(filters.countries) && filters.countries.length > 0) {
      queryParams.append('countries', filters.countries.join(','));
    } else if (filters.destinationCountry && filters.destinationCountry !== 'all') {
      queryParams.append('destinationCountry', filters.destinationCountry);
    }
    
    // Aggiungi volume se presente
    if (filters.volume) {
      queryParams.append('volume', filters.volume);
    }
    
    // Aggiungi sourceCountry (market) se presente
    if (filters.sourceCountry && filters.sourceCountry !== 'all') {
      queryParams.append('sourceCountry', filters.sourceCountry.toLowerCase());
    }
    
    // Aggiungi parametri opzionali aggiuntivi
    if (filters.minMargin) {
      queryParams.append('minMargin', filters.minMargin);
    }
    
    if (filters.maxPrice) {
      queryParams.append('maxPrice', filters.maxPrice);
    }
    
    if (filters.serviceType && filters.serviceType !== 'all') {
      queryParams.append('serviceType', filters.serviceType);
    }
    
    console.log('API call:', `${API_URL}/rates/compare?${queryParams.toString()}`);
    
    // Usa la funzione di utilità per fare la chiamata API, passando il signal
    const data = await fetchWithErrorHandling(`${API_URL}/rates/compare?${queryParams.toString()}`, {
      signal: signal,
    });
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio compareRates:', error);
    throw error; // Propaghiamo l'errore per gestirlo nel componente
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
 * Recupera le fasce di peso per un servizio specifico
 * @param serviceId - ID del servizio per cui recuperare le fasce di peso
 * @returns Una lista di fasce di peso con i relativi prezzi
 */
export async function getWeightRangesByService(serviceId: string): Promise<WeightRange[]> {
  try {
    if (!serviceId) {
      console.error('ERRORE: ServiceID mancante in getWeightRangesByService');
      return [];
    }
    
    console.log(`Richiesta fasce di peso per il servizio ID: ${serviceId}`);
    // URL corretto per la rotta definita in rateRoutes.js
    const url = `${API_URL}/rates/service/${serviceId}/weightRanges`;
    console.log(`URL richiesta: ${url}`);
    
    const result = await fetchWithErrorHandling(url);
    console.log('Risposta API fasce di peso:', result);
    
    // Assicuriamoci di restituire l'array di dati, non l'oggetto di risposta
    return result.data || [];
  } catch (error) {
    console.error('Errore nel servizio getWeightRangesByService:', error);
    return []; // Restituisci un array vuoto in caso di errore
  }
} 