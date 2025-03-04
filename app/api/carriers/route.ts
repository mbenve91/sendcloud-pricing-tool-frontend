import { NextResponse } from 'next/server';

// Questa è una API route di Next.js che fa da proxy verso il backend
// Utile quando il frontend è deployato e il backend è su un altro dominio
export async function GET() {
  try {
    // Usa l'URL del backend configurato nelle variabili d'ambiente o un valore di default
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5050/api/carriers';
    
    // Effettua la richiesta al backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disabilita la cache per ottenere sempre dati freschi
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    // Ottieni i dati come JSON
    const data = await response.json();

    // Restituisci i dati come risposta JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to backend:', error);
    
    // In caso di errore, restituisci un fallback o un errore
    return NextResponse.json(
      { error: 'Failed to fetch carriers from backend' },
      { status: 500 }
    );
  }
} 