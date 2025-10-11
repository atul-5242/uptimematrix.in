import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement organization data retrieval logic
    // This would typically fetch organization data from your database
    // For now, return a placeholder response
    
    return NextResponse.json({
      success: true,
      data: {
        id: 'org-123',
        name: 'Sample Organization',
        members: [],
        settings: {}
      }
    })
  } catch (error) {
    console.error('Error fetching organization data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch organization data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate input
    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Organization name and description are required' },
        { status: 400 }
      )
    }

    // Call backend API to create organization
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: body.name.trim(),
        description: body.description.trim()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create organization' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      data: data.data
    })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create organization' },
      { status: 500 }
    )
  }
}