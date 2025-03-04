import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // URL del template CSV sul backend
    const templateUrl = process.env.BACKEND_TEMPLATE_URL || 
                         'https://sendcloud-pricing-tool-backend.onrender.com/templates/carriers';
    
    console.log('Fetching CSV template from:', templateUrl);
    
    // Effettua la richiesta al backend
    const response = await fetch(templateUrl, {
      cache: 'no-store', // Disabilita la cache
    });

    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching CSV template:', errorText);
      throw new Error(`Failed to fetch CSV template: ${response.status}`);
    }

    // Ottieni il contenuto come testo
    const csvContent = await response.text();
    
    // Restituisci il CSV con gli header appropriati
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="template-carriers.csv"',
      },
    });
  } catch (error) {
    console.error('Error fetching CSV template:', error);
    
    // In caso di errore, restituisci un messaggio di errore
    return NextResponse.json(
      { error: 'Failed to fetch CSV template' },
      { status: 500 }
    );
  }
} 