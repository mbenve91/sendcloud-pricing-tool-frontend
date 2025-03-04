import { NextRequest, NextResponse } from 'next/server';

// Questa è una API route di Next.js che fa da proxy verso il backend per l'importazione CSV
export async function POST(request: NextRequest) {
  try {
    // Usa l'URL del backend configurato nelle variabili d'ambiente o un valore di default
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5050/api/carriers/import';
    
    // Ottieni i dati della richiesta come FormData
    const formData = await request.formData();
    
    // Effettua la richiesta al backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
      // Non è necessario impostare 'Content-Type' qui perché verrà impostato automaticamente con il boundary corretto per il FormData
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend responded with status: ${response.status}, message: ${errorText}`);
    }

    // Ottieni i dati come JSON
    const data = await response.json();

    // Restituisci i dati come risposta JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying CSV import to backend:', error);
    
    // In caso di errore, restituisci un errore
    return NextResponse.json(
      { error: 'Failed to import CSV to backend', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 