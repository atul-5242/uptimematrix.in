// this is next js in api -> status-page -> by-domain -> route.ts

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



const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REQUEST_TIMEOUT = 10000;

const toISOString = (date: any) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Try multiple sources for domain
  let domain = searchParams.get('domain');
  
  if (!domain) {
    // Get from nginx headers
    domain = request.headers.get('x-original-domain');
  }
  
  if (!domain) {
    // Fallback to host header
    domain = request.headers.get('host');
  }
  
  console.log('[Status Page] Received request for domain:', domain);
  console.log('[Status Page] All headers:', {
    'x-original-domain': request.headers.get('x-original-domain'),
    'host': request.headers.get('host'),
    'referer': request.headers.get('referer')
  });
  
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    console.log(`[Status Page] Calling backend API: ${API_URL}/api/status-pages/by-domain?domain=${encodeURIComponent(domain)}`);

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

    const response = await apiResponse.json();
    
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

    // [Keep all your existing formattedResponse mapping code exactly as is]
    const formattedResponse = {
      id: data.id || 'unknown',
      name: data.name || 'Status Page',
      description: data.description || 'Our services status',
      status: data.status || 'operational',
      lastUpdated: toISOString(data.lastUpdated || new Date()),
      logo: data.logo || null,
      branding: {
        primaryColor: data.branding?.primaryColor || '#3b82f6',
        headerBg: data.branding?.headerBg || '#1e40af',
        logo: data.logo || null
      },
      serviceGroups: (data.serviceGroups || []),
      incidents: (data.incidents || []),
      responseTimeData: data.responseTimeData || [],
      uptimeData: data.uptimeData || [],
      metrics: data.metrics || {
        overallUptime: 100,
        avgResponseTime: 0,
        totalChecks: 0
      }
    };

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