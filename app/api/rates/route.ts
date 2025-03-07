// API Routes per la gestione delle tariffe
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// Funzione per effettuare richieste con retry
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 2) {
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      console.error(`Tentativo ${retries + 1} fallito: status ${response.status}`);
    } catch (error) {
      console.error(`Tentativo ${retries + 1} fallito con errore:`, error);
    }
    
    // Attesa esponenziale prima di riprovare
    if (retries < maxRetries) {
      const waitTime = Math.pow(2, retries) * 500;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    retries++;
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

// Funzione per validare i dati delle tariffe
function validateRatesData(rates: any[]): any[] {
  if (!Array.isArray(rates)) {
    console.error('validateRatesData: Il parametro rates non è un array', rates);
    return [];
  }

  // Stampa i dati originali per debug
  console.log('Dati originali prima della validazione:', JSON.stringify(rates.slice(0, 2)));

  // Verifica se i dati sembrano già essere nel formato corretto
  const allRatesValid = rates.every(rate => 
    rate && 
    typeof rate === 'object' && 
    rate.service && 
    typeof rate.service === 'object' && 
    rate.service._id && 
    rate.service.name &&
    rate.service.carrier && 
    rate.service.carrier._id && 
    rate.service.carrier.name && 
    typeof rate.weightMin === 'number' && 
    typeof rate.weightMax === 'number' &&
    (typeof rate.purchasePrice === 'number' || typeof rate.retailPrice === 'number')
  );

  if (allRatesValid) {
    console.log('Dati già ben formattati, nessuna modifica necessaria');
    return rates;
  }

  console.log('Normalizzazione dati tariffe necessaria');

  return rates.map(rate => {
    // Assicuriamoci che rate sia un oggetto
    if (!rate || typeof rate !== 'object') {
      console.warn('validateRatesData: rate non è un oggetto valido', rate);
      return {
        _id: 'unknown-rate-id',
        weightMin: 0,
        weightMax: 0,
        purchasePrice: 0,
        retailPrice: 0,
        service: {
          _id: 'unknown-service',
          name: 'Unknown Service',
          carrier: {
            _id: 'unknown-carrier',
            name: 'Unknown Carrier'
          }
        }
      };
    }

    // Prepara un oggetto result conservando i valori originali
    const result = { ...rate };

    // Assicuriamoci che service sia un oggetto
    if (!rate.service || typeof rate.service !== 'object') {
      console.warn('validateRatesData: service non è un oggetto valido', rate);
      result.service = {
        _id: rate.serviceId || 'unknown-service',
        name: 'Unknown Service',
        carrier: {
          _id: 'unknown-carrier',
          name: 'Unknown Carrier'
        }
      };
    } else {
      // Assicuriamoci che service abbia le proprietà necessarie
      result.service = {
        ...(rate.service || {}),
        _id: rate.service._id || rate.serviceId || 'unknown-service',
        name: rate.service.name || 'Unknown Service'
      };

      // Assicuriamoci che carrier sia un oggetto
      if (!rate.service.carrier || typeof rate.service.carrier !== 'object') {
        console.warn('validateRatesData: carrier non è un oggetto valido', rate.service);
        result.service.carrier = {
          _id: rate.service.carrierId || 'unknown-carrier',
          name: 'Unknown Carrier'
        };
      } else {
        // Assicuriamoci che carrier abbia le proprietà necessarie
        result.service.carrier = {
          ...(rate.service.carrier || {}),
          _id: rate.service.carrier._id || rate.service.carrierId || 'unknown-carrier',
          name: rate.service.carrier.name || 'Unknown Carrier'
        };
      }
    }

    // Assicuriamoci che le proprietà numeriche siano valide
    result.weightMin = typeof rate.weightMin === 'number' ? rate.weightMin : 0;
    result.weightMax = typeof rate.weightMax === 'number' ? rate.weightMax : 0;
    result.purchasePrice = typeof rate.purchasePrice === 'number' ? rate.purchasePrice : 0;
    result.retailPrice = typeof rate.retailPrice === 'number' ? rate.retailPrice : 0;

    // Assicuriamoci che _id sia presente
    result._id = rate._id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return result;
  });
}

// Funzione di fallback per ottenere tariffe
async function fetchRatesFallback(serviceId?: string | null): Promise<any[]> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const apiPath = serviceId 
      ? `/rates/service/${serviceId}/weightRanges` 
      : '/rates';

    console.log(`Tentativo di recupero tariffe da: ${backendUrl}${apiPath}`);

    const response = await fetchWithRetry(`${backendUrl}${apiPath}`);
    const data = await response.json();

    if (Array.isArray(data)) {
      console.log(`Ricevute ${data.length} tariffe dal fallback`);
      return data;
    } else if (data && Array.isArray(data.data)) {
      console.log(`Ricevute ${data.data.length} tariffe dal fallback (formato .data)`);
      return data.data;
    } else {
      console.error('Formato dati dal fallback non riconosciuto:', data);
      return [];
    }
  } catch (error) {
    console.error('Errore durante il recupero delle tariffe dal fallback:', error);
    return [];
  }
}

// GET: Ottiene tutte le tariffe o filtra per servizio
export async function GET(request: NextRequest) {
  try {
    // Ottieni i parametri dalla query string
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service');

    // Log della richiesta per debug
    console.log(`GET /api/rates - Parametri: service=${serviceId || 'nessuno'}`);

    // Determina l'URL della backend API in base ai parametri
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    let apiPath = '/rates';
    
    // Se è specificato un service, usiamo l'endpoint specifico del servizio
    if (serviceId) {
      apiPath = `/rates/service/${serviceId}/weightRanges`;
      console.log(`Richiesta tariffe per servizio specifico: ${apiPath}`);
    }

    // Effettua la richiesta alla backend API
    const response = await fetchWithRetry(`${backendUrl}${apiPath}`);
    const data = await response.json();

    // Verifica che i dati siano in un formato supportato
    let rates: any[] = [];
    if (Array.isArray(data)) {
      console.log(`Ricevute ${data.length} tariffe (formato array)`);
      rates = data;
    } else if (data && Array.isArray(data.data)) {
      console.log(`Ricevute ${data.data.length} tariffe (formato .data)`);
      rates = data.data;
    } else {
      console.error('Formato dati non riconosciuto:', data);
      
      // Tenta il recupero con il metodo alternativo
      console.log('Tentativo con endpoint fallback...');
      rates = await fetchRatesFallback(serviceId);
      
      if (rates.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Formato dati non riconosciuto e fallback fallito' 
        }, { status: 500 });
      }
    }

    // Convalida e normalizza i dati
    const validatedRates = validateRatesData(rates);

    // Restituisci i dati
    console.log(`Restituzione di ${validatedRates.length} tariffe validate`);
    return NextResponse.json({
      success: true,
      data: validatedRates
    });
  } catch (error) {
    console.error('Errore durante il recupero delle tariffe:', error);
    
    // Tenta il recupero con il metodo alternativo
    try {
      const serviceId = new URL(request.url).searchParams.get('service');
      console.log('Tentativo con endpoint fallback dopo errore...');
      const rates = await fetchRatesFallback(serviceId);
      
      if (rates.length > 0) {
        const validatedRates = validateRatesData(rates);
        console.log(`Restituzione di ${validatedRates.length} tariffe dal fallback`);
        return NextResponse.json({
          success: true,
          data: validatedRates
        });
      }
    } catch (fallbackError) {
      console.error('Anche il fallback è fallito:', fallbackError);
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Impossibile recuperare le tariffe' 
    }, { status: 500 });
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