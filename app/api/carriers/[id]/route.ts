import { NextRequest, NextResponse } from 'next/server';

// GET - Ottieni un carrier specifico per ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`Fetching carrier details for ID: ${id}`);

    // URL del backend per ottenere un carrier specifico
    const backendUrl = `https://sendcloud-pricing-tool-backend.onrender.com/api/carriers/${id}`;
    
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
    
    // Ottieni i dati come JSON
    const data = await response.json();
    console.log(`Successfully received carrier details for ID: ${id}`);

    // Restituisci i dati come risposta JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching carrier with ID ${params.id}:`, error);
    
    // In caso di errore, restituisci un fallback o un errore
    return NextResponse.json(
      { error: 'Failed to fetch carrier details', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un carrier esistente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Estrai il corpo della richiesta come JSON
    const body = await request.json();
    
    console.log(`Updating carrier with ID: ${id}`);
    console.log('Updated carrier data:', JSON.stringify(body).substring(0, 200) + '...');

    // URL del backend per aggiornare un carrier specifico
    const backendUrl = `https://sendcloud-pricing-tool-backend.onrender.com/api/carriers/${id}`;
    
    // Effettua la richiesta PUT al backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
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
    console.log(`Successfully updated carrier with ID: ${id}`);

    // Restituisci i dati come risposta JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating carrier with ID ${params.id}:`, error);
    
    // In caso di errore, restituisci un messaggio di errore
    return NextResponse.json(
      { error: 'Failed to update carrier', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un carrier esistente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`Deleting carrier with ID: ${id}`);

    // URL del backend per eliminare un carrier specifico
    const backendUrl = `https://sendcloud-pricing-tool-backend.onrender.com/api/carriers/${id}`;
    
    // Effettua la richiesta DELETE al backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend responded with status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
    }
    
    // Restituisci un messaggio di successo
    return NextResponse.json({ success: true, message: 'Carrier deleted successfully' });
  } catch (error) {
    console.error(`Error deleting carrier with ID ${params.id}:`, error);
    
    // In caso di errore, restituisci un messaggio di errore
    return NextResponse.json(
      { error: 'Failed to delete carrier', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 