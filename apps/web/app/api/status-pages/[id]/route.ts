import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { message: 'No authorization header' },
      { status: 401 }
    )
  }

  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Status page ID is required' },
        { status: 400 }
      )
    }

    // Ensure NEXT_PUBLIC_API_URL is set
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Ensure we have a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Invalid authorization header format. Expected: Bearer <token>' },
        { status: 401 }
      );
    }
    
    console.log('Deleting status page:', `${apiBaseUrl}/api/status-pages/${id}`);
    
    const response = await fetch(`${apiBaseUrl}/api/status-pages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { 
          success: false,
          message: error.message || 'Failed to delete status page',
          error: error.error 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      message: 'Status page deleted successfully',
      data: data.data
    })
  } catch (error) {
    console.error('Error deleting status page:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}