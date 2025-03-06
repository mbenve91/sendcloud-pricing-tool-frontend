// API Routes per la gestione dei servizi
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// GET: Ottiene tutti i servizi o filtra per corriere
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const carrierId = searchParams.get('carrier');
    
    let url = `${API_URL}/services`;
    if (carrierId) {
      url += `?carrier=${carrierId}`;
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
        { success: false, message: 'Failed to fetch services' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching services' },
      { status: 500 }
    );
  }
}

// POST: Crea un nuovo servizio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/services`, {
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
        { success: false, message: errorData.message || 'Failed to create service' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating service' },
      { status: 500 }
    );
  }
} 