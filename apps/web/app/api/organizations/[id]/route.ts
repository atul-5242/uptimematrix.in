import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationId = params.id;
    let authToken = request.headers.get('authorization');

    if (!authToken) {
      const cookieStore = cookies();
      const sessionToken = cookieStore.get('session_token')?.value;
      if (sessionToken) {
        authToken = `Bearer ${sessionToken}`;
      }
    }

    console.log(`[API Proxy] GET /api/organizations/${organizationId} - Auth Token: ${!!authToken}`);

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const backendUrl = "https://api.uptimematrix.atulmaurya.in/";
    console.log(`[API Proxy] Forwarding GET to: ${backendUrl}/organization/${organizationId}`);

    const response = await fetch(`${backendUrl}/organization/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
    });

    console.log(`[API Proxy] Backend response status for GET ${organizationId}: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API Proxy] Backend error for GET ${organizationId}:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const organizationData = await response.json();
    console.log(`[API Proxy] Successfully fetched organization ${organizationId} data.`);
    return NextResponse.json(organizationData);
  } catch (error) {
    console.error('Error fetching organization details:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationId = params.id;
    let authToken = request.headers.get('authorization');

    if (!authToken) {
      const cookieStore = cookies();
      const sessionToken = cookieStore.get('session_token')?.value;
      if (sessionToken) {
        authToken = `Bearer ${sessionToken}`;
      }
    }

    console.log(`[API Proxy] DELETE /api/organizations/${organizationId} - Auth Token: ${!!authToken}`);

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const backendUrl = "https://api.uptimematrix.atulmaurya.in/";
    console.log(`[API Proxy] Forwarding DELETE to: ${backendUrl}/organization/${organizationId}`);

    const response = await fetch(`${backendUrl}/organization/${organizationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
    });

    console.log(`[API Proxy] Backend response status for DELETE ${organizationId}: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API Proxy] Backend error for DELETE ${organizationId}:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log(`[API Proxy] Successfully deleted organization ${organizationId}.`);
    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
