import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // URL per le istruzioni del template CSV
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5050'
      : 'https://sendcloud-pricing-tool-backend.onrender.com';
    
    const instructionsUrl = `${backendUrl}/templates/carriers/instructions`;
    
    console.log('Fetching template instructions from:', instructionsUrl);
    
    // Effettua la richiesta al backend
    const response = await fetch(instructionsUrl, {
      cache: 'no-store', // Disabilita la cache
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching template instructions:', errorText);
      throw new Error(`Failed to fetch template instructions: ${response.status}`);
    }

    // Ottieni il contenuto come testo
    const instructionsContent = await response.text();
    
    // Restituisci le istruzioni con gli header appropriati
    return new NextResponse(instructionsContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="istruzioni-template.txt"',
      },
    });
  } catch (error) {
    console.error('Error fetching template instructions:', error);
    
    // In caso di errore, restituisci un messaggio di errore
    return NextResponse.json(
      { error: 'Failed to fetch template instructions' },
      { status: 500 }
    );
  }
} 