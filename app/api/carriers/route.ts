// API Routes per la gestione dei corrieri
import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_CARRIERS, fetchWithTimeout } from '@/data/fallbackData';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// Funzione per gestire meglio gli errori e i tentativi multipli
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3, timeoutMs = 7000) {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      // Utilizziamo la funzione fetchWithTimeout
      const response = await fetchWithTimeout(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        cache: 'no-store'
      }, timeoutMs);
      
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
    } catch (error: any) {
      lastError = error;
      console.error(`Tentativo ${i+1}/${retries+1} fallito:`, error.name, error.message);
      
      // Se abbiamo altri tentativi, aspettiamo un po' prima di riprovare
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  // Se arriviamo qui, tutti i tentativi sono falliti
  throw lastError;
}

// GET: Ottiene tutti i corrieri
export async function GET(request: NextRequest) {
  try {
    // Tentiamo di ottenere i dati con retry
    try {
      const data = await fetchWithRetry(`${API_URL}/carriers`);
      return NextResponse.json({ success: true, data: data.data || [] });
    } catch (error) {
      console.error(`Error fetching carriers from backend: ${error}`);
      
      // Restituire i dati di fallback invece di un array vuoto
      return NextResponse.json({ 
        success: true,
        data: FALLBACK_CARRIERS,
        message: "Backend API unavailable. Showing fallback data."
      });
    }
  } catch (error) {
    console.error('Error in carriers API route:', error);
    // Anche in caso di errore generale, restituiamo comunque i dati di fallback
    return NextResponse.json(
      { 
        success: true, 
        data: FALLBACK_CARRIERS,
        message: "Error processing request. Showing fallback data."
      },
      { status: 200 }
    );
  }
}

// POST: Crea un nuovo corriere
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetchWithTimeout(`${API_URL}/carriers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to create carrier' },
        { status: 200 }  // Restituiamo 200 invece di propagare l'errore del backend
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error creating carrier:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating carrier', data: null },
      { status: 200 }
    );
  }
} 