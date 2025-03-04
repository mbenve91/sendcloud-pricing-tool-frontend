import { NextRequest, NextResponse } from 'next/server';

// Questa è una API route di Next.js che fa da proxy verso il backend per l'importazione CSV
export async function POST(request: NextRequest) {
  try {
    // URL completo del backend per l'importazione CSV
    const backendUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5050/api/carriers/import'
      : 'https://sendcloud-pricing-tool-backend.onrender.com/api/carriers/import';

    console.log('Forwarding CSV import to backend:', backendUrl);

    // Ottieni il FormData dalla richiesta
    const formData = await request.formData();
    
    // Controlla se c'è un file
    if (!formData.has('file')) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log del contenuto del FormData per debugging
    console.log('Forwarding file to backend:', formData.get('file'));

    // Inoltra la richiesta al backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });

    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from backend:', errorText);
      return NextResponse.json(
        { error: `Backend response error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Ottieni la risposta come JSON
    const data = await response.json();
    
    // Restituisci la risposta
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error importing CSV:', error);
    
    // In caso di errore, restituisci un messaggio di errore
    return NextResponse.json(
      { error: 'Failed to import CSV to backend', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 