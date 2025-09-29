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
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Ensure we have a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Invalid authorization header format. Expected: Bearer <token>' },
        { status: 401 }
      );
    }

    console.log('Forwarding request to:', `${apiBaseUrl}/api/status-pages`);
    
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
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating status page:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
