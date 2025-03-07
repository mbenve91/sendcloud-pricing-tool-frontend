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
        return await response.json();
      }
      
      // Altrimenti gestiamo l'errore
      lastError = new Error(`API request failed with status: ${response.status}`);
      
      // Se abbiamo altri tentativi, aspettiamo un po' prima di riprovare
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    } catch (error) {
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

// GET: Ottiene tutte le tariffe o filtra per servizio
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service');
    const weightParam = searchParams.get('weight');
    
    let url = `${API_URL}/rates`;
    const queryParams = [];
    
    if (serviceId) {
      queryParams.push(`service=${serviceId}`);
    }
    
    if (weightParam) {
      queryParams.push(`weight=${weightParam}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    // Tentiamo di ottenere i dati con retry
    try {
      const data = await fetchWithRetry(url);
      return NextResponse.json({ success: true, data: data.data || [] });
    } catch (error) {
      console.error(`Error fetching rates from backend: ${error}`);
      
      // Restituire un array vuoto invece di un errore
      return NextResponse.json({ 
        success: true,
        data: [],
        message: "Backend API unavailable. Showing empty results."
      });
    }
  } catch (error) {
    console.error('Error in rates API route:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing rates request', data: [] },
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