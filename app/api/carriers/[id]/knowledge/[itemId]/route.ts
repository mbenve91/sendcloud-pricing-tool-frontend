// API Routes per la gestione di un singolo elemento della knowledge base
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : 'http://localhost:5050/api';

// PUT: Aggiorna un elemento della knowledge base
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const { id, itemId } = params;
    const body = await request.json();
    
    console.log(`Sending PUT request to ${API_BASE_URL}/carriers/${id}/knowledge/${itemId}`);
    
    const response = await fetch(`${API_BASE_URL}/carriers/${id}/knowledge/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to update knowledge item';
      try {
        const text = await response.text();
        console.error('Error response text:', text);
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error('Error reading response text:', e);
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error updating knowledge item:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating knowledge item' },
      { status: 500 }
    );
  }
}

// DELETE: Elimina un elemento della knowledge base
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const { id, itemId } = params;
    
    console.log(`Sending DELETE request to ${API_BASE_URL}/carriers/${id}/knowledge/${itemId}`);
    
    const response = await fetch(`${API_BASE_URL}/carriers/${id}/knowledge/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete knowledge item';
      try {
        const text = await response.text();
        console.error('Error response text:', text);
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error('Error reading response text:', e);
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Knowledge item deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge item:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting knowledge item' },
      { status: 500 }
    );
  }
} 