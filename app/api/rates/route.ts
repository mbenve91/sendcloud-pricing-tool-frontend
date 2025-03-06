// API Routes per la gestione delle tariffe
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// GET: Ottiene tutte le tariffe o filtra per servizio
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service');
    const weightParam = searchParams.get('weight');
    
    let url = `${API_URL}/rates`;
    const queryParams = [];
    
    if (serviceId) {
      queryParams.push(`service=${serviceId}`);
    }
    
    if (weightParam) {
      queryParams.push(`weight=${weightParam}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch rates' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching rates' },
      { status: 500 }
    );
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
        // Aggiungi eventuali header di autorizzazione
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to create rate' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error creating rate:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating rate' },
      { status: 500 }
    );
  }
} 