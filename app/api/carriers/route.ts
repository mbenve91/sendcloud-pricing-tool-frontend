// API Routes per la gestione dei corrieri
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// GET: Ottiene tutti i corrieri
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/carriers`, {
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch carriers' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching carriers' },
      { status: 500 }
    );
  }
}

// POST: Crea un nuovo corriere
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/carriers`, {
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
        { success: false, message: errorData.message || 'Failed to create carrier' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error creating carrier:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating carrier' },
      { status: 500 }
    );
  }
} 