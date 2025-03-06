// API Routes per la gestione di un singolo corriere
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// GET: Ottiene un corriere specifico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const response = await fetch(`${API_URL}/carriers/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch carrier' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error fetching carrier:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching carrier' },
      { status: 500 }
    );
  }
}

// PUT: Aggiorna un corriere specifico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/carriers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to update carrier' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error updating carrier:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating carrier' },
      { status: 500 }
    );
  }
}

// DELETE: Elimina un corriere specifico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const response = await fetch(`${API_URL}/carriers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to delete carrier' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Carrier deleted successfully' });
  } catch (error) {
    console.error('Error deleting carrier:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting carrier' },
      { status: 500 }
    );
  }
} 