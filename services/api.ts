// services/api.ts - Servizio per interagire con l'API backend

// URL per il backend su Render
// In produzione, usa sempre l'URL di Render per evitare riferimenti a localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

const API_BASE_URL = isProduction
  ? 'https://sendcloud-pricing-tool-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050');

// Funzione di utilità per le chiamate fetch con gestione degli errori
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      // Assicurati che le credenziali non siano inviate per evitare problemi CORS
      credentials: 'omit', 
      // Imposta mode: 'cors' esplicitamente
      mode: 'cors'
    });
    
    if (!response.ok) {
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
    
    const response = await fetch(`${API_URL}/rates/compare?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Errore durante il confronto delle tariffe: ${response.statusText}`);
    }
    
    const data = await response.json();
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
    const response = await fetch(`${API_URL}/rates/${id}`);
    
    if (!response.ok) {
      throw new Error(`Errore durante il recupero dei dettagli della tariffa: ${response.statusText}`);
    }
    
    const data = await response.json();
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Errore durante il recupero dei servizi: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Errore nel servizio getServices:', error);
    throw error;
  }
} 