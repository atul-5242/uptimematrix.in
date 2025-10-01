import { NextResponse } from 'next/server';

// Type definitions
interface Service {
  id: string;
  name: string;
  description: string | null;
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'major_outage' | 'unknown';
  uptime: number;  // Changed from object to number
  responseTime: number;
  lastCheck: string;
  uptimeHistory?: Array<{
    date: string;
    uptime: number;
    status: string;
  }>;
}

interface ServiceGroup {
  id: string;
  name: string;
  status: string;
  services: Service[];
}

interface IncidentUpdate {
  id: string;
  status: string;
  message: string;
  timestamp: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  updates: IncidentUpdate[];
  affectedServices: string[];
}

interface StatusPageData {
  id: string;
  name: string;
  description: string;
  status: string;
  lastUpdated: string;
  logo: string | null;
  branding: {
    primaryColor: string;
    headerBg: string;
    logo: string | null;
  };
  serviceGroups: ServiceGroup[];
  incidents: Incident[];
  metrics: {
    overallUptime: number;
    avgResponseTime: number;
    totalChecks: number;
  };
  responseTimeData: Array<{ time: string; responseTime: number }>;  // Changed field names
  uptimeData: Array<{ date: string; uptime: number }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Helper function to format date to ISO string
const toISOString = (date: any) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

// Type for the API response
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Type for the status page data from the controller
interface ControllerStatusPageData {
  id: string;
  name?: string;
  description?: string;
  overallStatus?: string;
  updatedAt?: string;
  logo?: string | null;
  primaryColor?: string;
  headerBg?: string;
  metrics?: {
    overallUptime: number;
    avgResponseTime: number;
    totalChecks: number;
  };
  serviceGroups?: Array<{
    id: string;
    name: string;
    status?: string;
    services?: Array<{
      id: string;
      name: string;
      description?: string;
      status?: string;
      uptime24h?: number;
      uptime7d?: number;
      uptime30d?: number;
      uptime90d?: number;
      responseTime?: number;
      lastCheck?: string;
    }>;
  }>;
  incidents?: Array<{
    id: string;
    title: string;
    description?: string;
    status?: string;
    severity?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string | null;
    updates?: Array<{
      id: string;
      status: string;
      message?: string;
      timestamp?: string;
      createdAt?: string;
    }>;
    affectedServices?: string[];
  }>;
  responseTimeData?: Array<{ timestamp: string; value: number }>;
  uptimeData?: Array<{ date: string; uptime: number }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Try to get domain from query param first, then from Nginx header
  let domain = searchParams.get('domain');
  
  if (!domain) {
    // Get from custom header set by Nginx
    domain = request.headers.get('x-original-domain') || request.headers.get('host');
  }
  
  console.log('[Status Page] Received request for domain:', domain);
  
  if (!domain) {
    return NextResponse.json(
      { success: false, message: 'Domain parameter is required' },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        } 
      }
    );
  }

  try {
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Call the backend API to get status page data
    const apiResponse = await fetch(`${API_URL}/api/status-pages/by-domain?domain=${encodeURIComponent(domain)}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store',
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!apiResponse.ok) {
      let errorMessage = 'Failed to fetch status page data';
      try {
        const errorData = await apiResponse.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    const response = await apiResponse.json() as ApiResponse<ControllerStatusPageData>;
    
    if (!response.success || !response.data) {
      return NextResponse.json(
        { 
          success: false, 
          message: response.message || 'Status page data not found' 
        },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          }
        }
      );
    }

    const data = response.data;

    // Transform the data to match the frontend's expected format
    const formattedResponse = {
      id: data.id || 'unknown',
      name: data.name || 'Status Page',
      description: data.description || 'Our services status',
      status: data.overallStatus || 'operational',
      lastUpdated: toISOString(data.updatedAt || new Date()),
      logo: data.logo || null,
      branding: {
        primaryColor: data.primaryColor || '#3b82f6',
        headerBg: data.headerBg || '#1e40af',
        logo: data.logo || null
      },
      // Map service groups from the controller response
      serviceGroups: (data.serviceGroups || []).map((group: any) => ({
        id: group.id || `group-${Math.random().toString(36).substr(2, 9)}`,
        name: group.name || 'Unnamed Group',
        status: group.status || 'operational',
        services: (group.services || []).map((service: any) => ({
          id: service.id || `service-${Math.random().toString(36).substr(2, 9)}`,
          name: service.name || 'Unnamed Service',
          description: service.description || '',
          status: service.status || 'operational',
          uptime: service.uptime ?? 100,  // Single number, not object
          responseTime: service.responseTime ?? 0,
          lastCheck: toISOString(service.lastCheck || new Date()),
          uptimeHistory: service.uptimeHistory || []  // Add this line
        }))
      })),
      // Map incidents from the controller response
      incidents: (data.incidents || []).map((incident: any) => ({
        id: incident.id || `incident-${Math.random().toString(36).substr(2, 9)}`,
        title: incident.title || 'Untitled Incident',
        description: incident.description || '',
        status: incident.status?.toLowerCase() || 'investigating',
        severity: incident.severity || 'none',
        createdAt: toISOString(incident.createdAt || new Date()),
        updatedAt: toISOString(incident.updatedAt || new Date()),
        resolvedAt: incident.resolvedAt ? toISOString(incident.resolvedAt) : null,
        updates: (incident.updates || []).map((update: any) => ({
          id: update.id || `update-${Math.random().toString(36).substr(2, 9)}`,
          status: update.status || 'pending',
          message: update.message || '',
          timestamp: toISOString(update.timestamp || update.createdAt || new Date())
        })),
        affectedServices: incident.affectedServices || []
      })),
      // Map metrics data
      responseTimeData: data.responseTimeData || [],
      uptimeData: data.uptimeData || [],
      metrics: data.metrics || {
        overallUptime: 100,
        avgResponseTime: 0,
        totalChecks: 0
      }
    };

    // Calculate overall status based on services
    if (formattedResponse.serviceGroups.length > 0) {
      const allServices = formattedResponse.serviceGroups.flatMap((group: ServiceGroup) => group.services);
      if (allServices.some((s: Service) => s.status === 'down')) {
        formattedResponse.status = 'down';
      } else if (allServices.some((s: Service) => s.status === 'degraded')) {
        formattedResponse.status = 'degraded';
      } else {
        formattedResponse.status = 'operational';
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: formattedResponse 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Error in /api/status-pages/by-domain:', error);
    const status = error instanceof Error && error.name === 'AbortError' ? 504 : 500;
    return NextResponse.json(
      { 
        success: false, 
        message: status === 504 
          ? 'Request to the status page service timed out' 
          : error instanceof Error ? error.message : 'Internal server error'
      },
      { 
        status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      }
    );
  }
}
