// API Routes per la gestione delle tariffe
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// Funzione per gestire meglio gli errori e i tentativi multipli
async function fetchWithRetry(url: string, options?: RequestInit, retries = 2) {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Tentativo ${i+1} per ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        cache: 'no-store'
      });
      
      // Se la risposta è OK, restituiamo direttamente la risposta
      if (response.ok) {
        const data = await response.json();
        console.log(`Risposta OK da ${url}`, data);
        return data;
      }
      
      // Altrimenti gestiamo l'errore
      const errorText = await response.text().catch(() => "Couldn't read error response");
      console.error(`Fetch fallito per URL ${url}: ${response.status} - ${errorText}`);
      lastError = new Error(`API request failed with status: ${response.status} - ${errorText}`);
      
      // Se abbiamo altri tentativi, aspettiamo un po' prima di riprovare
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    } catch (error) {
      console.error(`Errore di rete per URL ${url}:`, error);
      lastError = error;
      // Se abbiamo altri tentativi, aspettiamo un po' prima di riprovare
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  // Se arriviamo qui, tutti i tentativi sono falliti
  throw lastError;
}

// Funzione di fallback per ottenere i dati usando l'API compareRates
async function fetchRatesFallback(serviceId?: string | null, weight?: string | null) {
  try {
    console.log(`Utilizzo API fallback per ottenere tariffe (service=${serviceId}, weight=${weight})`);
    
    // Costruiamo i filtri per compareRates
    const filters: any = {
      weight: weight || "1",
      destinationType: "national" // Default
    };
    
    // Aggiungiamo l'ID del servizio se specificato
    if (serviceId) {
      filters.serviceId = serviceId;
    }
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value as string);
      }
    });
    
    const url = `${API_URL}/rates/compare?${queryParams.toString()}`;
    console.log(`API fallback URL: ${url}`);
    
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Fallback API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Dati fallback ottenuti:", data);
    
    // Formatta i dati ricevuti nel formato atteso
    if (data.data && Array.isArray(data.data)) {
      return { data: data.data };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.error("Errore nell'API fallback:", error);
    throw error;
  }
}

// GET: Ottiene tutte le tariffe o filtra per servizio
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service');
    const weightParam = searchParams.get('weight');
    
    let url;
    
    // Se abbiamo un serviceId, usiamo l'endpoint specifico per le tariffe di quel servizio
    // Questo corrisponde al percorso usato nel componente principale
    if (serviceId && serviceId !== "_all") {
      url = `${API_URL}/rates/service/${serviceId}/weightRanges`;
      
      // Se c'è anche un peso, possiamo aggiungerlo come query parameter
      if (weightParam) {
        url += `?weight=${weightParam}`;
      }
    } else {
      // Altrimenti, usiamo l'endpoint generale per tutte le tariffe
      url = `${API_URL}/rates`;
      const queryParams = [];
      
      if (weightParam) {
        queryParams.push(`weight=${weightParam}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
    }
    
    console.log("Chiamata API tariffe:", url);
    
    try {
      // Primo tentativo: usa l'endpoint diretto
      const data = await fetchWithRetry(url);
      console.log("Risposta API tariffe:", data);
      return NextResponse.json({ 
        success: true, 
        data: Array.isArray(data.data) ? data.data : (data.data ? [data.data] : [])
      });
    } catch (directError) {
      console.error(`Errore nell'endpoint diretto: ${directError}`);
      
      try {
        // Secondo tentativo: usa l'API compare come fallback
        const fallbackData = await fetchRatesFallback(
          serviceId !== "_all" ? serviceId : null, 
          weightParam
        );
        return NextResponse.json({
          success: true,
          data: fallbackData.data,
          message: "Dati ottenuti tramite API fallback"
        });
      } catch (fallbackError) {
        console.error(`Errore nel fallback: ${fallbackError}`);
        // Entrambi i tentativi falliti, restituiamo un array vuoto
        return NextResponse.json({ 
          success: true,
          data: [],
          message: "Nessun risultato disponibile da entrambe le API"
        });
      }
    }
  } catch (error) {
    console.error('Errore nella route API tariffe:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'elaborazione della richiesta tariffe', data: [] },
      { status: 200 }  // Restituiamo 200 invece di 500 con un messaggio d'errore
    );
  }
}

// POST: Crea una nuova tariffa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to create rate' },
        { status: 200 }  // Restituiamo 200 invece di propagare l'errore del backend
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error creating rate:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating rate', data: null },
      { status: 200 }
    );
  }
} 