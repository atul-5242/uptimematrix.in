import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { message: 'No authorization header' },
      { status: 401 }
    );
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('NEXT_PUBLIC_API_URL is not defined');
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status-pages/monitors`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch monitors';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    // Ensure we return the data in the expected format
    return NextResponse.json({
      success: true,
      data: responseData.data || []
    });
    
  } catch (error) {
    console.error('Error fetching monitors:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
