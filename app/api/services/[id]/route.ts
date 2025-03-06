// API Routes per la gestione di un singolo servizio
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api');

// GET: Ottiene un servizio specifico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const response = await fetch(`${API_URL}/services/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch service' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching service' },
      { status: 500 }
    );
  }
}

// PUT: Aggiorna un servizio specifico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/services/${id}`, {
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
        { success: false, message: errorData.message || 'Failed to update service' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating service' },
      { status: 500 }
    );
  }
}

// DELETE: Elimina un servizio specifico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi eventuali header di autorizzazione
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to delete service' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting service' },
      { status: 500 }
    );
  }
} 