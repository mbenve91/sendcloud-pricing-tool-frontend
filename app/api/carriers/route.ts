import { NextResponse } from 'next/server';

// Questa è una API route di Next.js che fa da proxy verso il backend
// Utile quando il frontend è deployato e il backend è su un altro dominio
export async function GET() {
  try {
    // Usa l'URL del backend configurato nelle variabili d'ambiente o un valore di default
    // IMPORTANTE: Assicurati che l'URL contenga il percorso completo /api/carriers
    const backendUrl = 'https://sendcloud-pricing-tool-backend.onrender.com/api/carriers';
    
    console.log('Fetching carriers from backend URL:', backendUrl);
    
    // Effettua la richiesta al backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store', // Disabilita la cache per ottenere sempre dati freschi
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend responded with status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Backend returned non-JSON response:', textResponse.substring(0, 200));
      throw new Error('Backend did not return JSON');
    }
    
    // Ottieni i dati come JSON
    const data = await response.json();
    console.log('Successfully received JSON data from backend');

    // Restituisci i dati come risposta JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to backend:', error);
    
    // In caso di errore, restituisci un fallback o un errore
    return NextResponse.json(
      { error: 'Failed to fetch carriers from backend', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 

// Funzione POST per creare un nuovo corriere
export async function POST(request: Request) {
  try {
    // Estrai il corpo della richiesta come JSON
    const body = await request.json();
    
    // URL del backend per la creazione dei corrieri
    const backendUrl = 'https://sendcloud-pricing-tool-backend.onrender.com/api/carriers';
    
    console.log('Creating new carrier on backend:', backendUrl);
    console.log('Carrier data:', JSON.stringify(body).substring(0, 200) + '...');
    
    // Effettua la richiesta POST al backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend responded with status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
    }
    
    // Ottieni i dati come JSON dalla risposta del backend
    const data = await response.json();
    console.log('Successfully created carrier, received response:', JSON.stringify(data).substring(0, 200) + '...');

    // Restituisci i dati come risposta JSON
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating carrier:', error);
    
    // In caso di errore, restituisci un messaggio di errore
    return NextResponse.json(
      { error: 'Failed to create carrier', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 