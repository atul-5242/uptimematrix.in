import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { message: 'No authorization header' },
      { status: 401 }
    )
  }

  try {
    // Ensure NEXT_PUBLIC_API_URL is set
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Ensure we have a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Invalid authorization header format. Expected: Bearer <token>' },
        { status: 401 }
      );
    }
    
    console.log('Fetching status pages from:', `${apiBaseUrl}/api/status-pages`);
    
    const response = await fetch(`${apiBaseUrl}/api/status-pages`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Failed to fetch status pages' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching status pages:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { message: 'No authorization header' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    
    // Ensure NEXT_PUBLIC_API_URL is set
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Ensure we have a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Invalid authorization header format. Expected: Bearer <token>' },
        { status: 401 }
      );
    }

    // console.log('Forwarding request to:', `${apiBaseUrl}/api/status-pages`);
    
    const response = await fetch(`${apiBaseUrl}/api/status-pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // Forward the Bearer token
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Failed to create status page' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data.id) {
      return NextResponse.json(
        { success: false, message: 'Status page ID is required' },
        { status: 400 }
      );
    }
    
    // If status page was created successfully, proceed with domain provisioning
    if (body.subdomain || body.customDomain) {
      try {

    // Forward the request to the API server
    const response = await fetch(`${apiBaseUrl}/api/status-pages/${data.id}/provision-domain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify({
        subdomain: body.subdomain,
        domain: body.customDomain
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

    const domainData = await response.json();
    return NextResponse.json({
      success: true,
      data: {
        ...domainData,
        id: domainData.id,
        subdomain: domainData.subdomain || body.subdomain,
        domain: domainData.domain || body.customDomain
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

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating status page:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
