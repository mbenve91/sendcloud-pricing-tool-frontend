export const dynamic = 'force-dynamic'; // Disabilita la cache

export async function GET(req, { params }) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const { offerId } = params;
  
  try {
    // Inoltra la richiesta al backend
    const response = await fetch(`${backendUrl}/api/assistant/offer/${offerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Se la risposta non è OK, lancia un errore
    if (!response.ok) {
      console.error('Backend error:', await response.text());
      return new Response(
        JSON.stringify({ success: false, message: 'Errore nella comunicazione con il backend' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Restituisci la risposta dal backend
    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in API proxy:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Errore del server: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 