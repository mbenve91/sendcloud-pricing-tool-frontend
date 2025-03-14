import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// URL per il backend
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://sendcloud-pricing-tool-backend.onrender.com/api' 
  : 'http://localhost:5050/api';

// Configuration for the Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const { message, carrierId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    if (!carrierId) {
      return NextResponse.json(
        { success: false, message: 'Carrier ID is required' },
        { status: 400 }
      );
    }

    // Fetch carrier knowledge base from backend
    const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch carrier data' },
        { status: response.status }
      );
    }

    const { data: carrier } = await response.json();
    
    if (!carrier.knowledgeBase || carrier.knowledgeBase.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No knowledge base found for this carrier' },
        { status: 404 }
      );
    }

    // Filter only active knowledge items
    const activeKnowledgeItems = carrier.knowledgeBase.filter(
      (item: any) => item.isActive
    );

    // Create context from knowledge base items
    const context = activeKnowledgeItems.map((item: any) => {
      return `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}\n\n`;
    }).join('');

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Create a prompt for Gemini
    const prompt = `You are an AI assistant for Sendcloud that provides information about shipping carriers.
You are helping users with questions about ${carrier.name}.
Use only the information provided in the context below to answer the question. 
If you don't have the information in the context to answer the question, say "I don't have enough information to answer that question".
Be concise, professional and friendly in your responses.
Use the same language as the user's question.

CONTEXT ABOUT ${carrier.name}:
${context}

USER QUESTION: ${message}`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response_text = result.response.text();

    return NextResponse.json({
      success: true,
      data: {
        response: response_text,
        carrier: carrier.name,
      }
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing chat request' },
      { status: 500 }
    );
  }
} 