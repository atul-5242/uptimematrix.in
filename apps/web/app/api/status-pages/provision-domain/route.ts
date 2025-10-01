import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
  try {
    const { statusPageId, subdomain, customDomain } = await req.json();
    
    if (!statusPageId) {
      return NextResponse.json(
        { success: false, message: 'Status page ID is required' },
        { status: 400 }
      );
    }

    if (!subdomain && !customDomain) {
      return NextResponse.json(
        { success: false, message: 'Either subdomain or custom domain is required' },
        { status: 400 }
      );
    }

    // Forward the request to the API server
    const response = await fetch(`${API_BASE_URL}/api/status-pages/${statusPageId}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        subdomain,
        domain: customDomain
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to provision domain',
          error: errorData.error || 'Unknown error',
          details: errorData.details
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        statusPageId,
        subdomain: data.subdomain || subdomain,
        domain: data.domain || customDomain
      }
    });

  } catch (error) {
    console.error('Error in domain provisioning:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}