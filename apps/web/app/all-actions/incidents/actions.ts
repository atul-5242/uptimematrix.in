"use server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function getIncidentAnalytics(incidentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${incidentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch incident analytics: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incident analytics:', error)
    throw error
  }
}

export async function updateIncidentStatus(incidentId: string, status: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${incidentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update incident status: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating incident status:', error)
    throw error
  }
}

export async function createIncidentUpdate(incidentId: string, message: string, type: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${incidentId}/updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, type }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create incident update: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating incident update:', error)
    return { success: false, error }
  }
}

export async function getIncidentUpdates(incidentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${incidentId}/updates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch incident updates: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incident updates:', error)
    return []
  }
}

export async function getIncidents(organizationId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents?organizationId=${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return []
  }
}

export async function getIncidentStats(organizationId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents/stats?organizationId=${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch incident stats: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incident stats:', error)
    return {
      total: 0,
      open: 0,
      acknowledged: 0,
      investigating: 0,
      resolved: 0,
      closed: 0,
      avgResolutionTime: 0,
      criticalIncidents: 0
    }
  }
}