// API Routes per la gestione della knowledge base di un corriere
import { NextRequest, NextResponse } from 'next/server';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : 'http://localhost:5050/api';

// POST: Aggiunge un elemento di knowledge base a un corriere
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log(`Sending request to ${API_BASE_URL}/carriers/${id}/knowledge with body:`, body);
    
    const response = await fetch(`${API_BASE_URL}/carriers/${id}/knowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to add knowledge item';
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
    console.error('Error adding knowledge item:', error);
    return NextResponse.json(
      { success: false, message: 'Error adding knowledge item' },
      { status: 500 }
    );
  }
} 