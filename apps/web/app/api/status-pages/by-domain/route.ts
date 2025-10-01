import { NextResponse } from 'next/server';

// Type definitions
interface Service {
  id: string;
  name: string;
  description: string | null;
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'major_outage' | 'unknown';
  uptime: {
    '24h': number;
    '7d': number;
    '30d': number;
    '90d': number;
  };
  responseTime: number;
  lastCheck: string;
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
  responseTimeData: Array<{ timestamp: string; value: number }>;
  uptimeData: Array<{ date: string; uptime: number }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to format date to ISO string
const toISOString = (date: any) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      { success: false, message: 'Domain parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Call the backend API to get status page data
    const apiResponse = await fetch(`${API_URL}/api/status-pages/by-domain?domain=${domain}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Prevent caching to get fresh data
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch status page data');
    }

    const { data, success, message } = await apiResponse.json();
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: message || 'Status page not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend's expected format
    const formattedResponse = {
      id: data.id,
      name: data.title || 'Status Page',
      description: data.description || 'Our services status',
      status: 'operational', // Default status, will be calculated from services
      lastUpdated: toISOString(data.lastUpdated),
      logo: data.logo || null,
      branding: {
        primaryColor: data.primaryColor || '#3b82f6',
        headerBg: data.headerBg || '#1e40af',
        logo: data.logo || null
      },
      // Group services by their groups
      serviceGroups: (data.services || []).reduce((groups: ServiceGroup[], service: any) => {
        // If service has no group, add to default group
        const groupName = service.group || 'Services';
        let group = groups.find(g => g.name === groupName);
        
        if (!group) {
          group = {
            id: `group-${groups.length + 1}`,
            name: groupName,
            status: 'operational',
            services: []
          };
          groups.push(group);
        }
        
        // Add service to group
        group.services.push({
          id: service.id,
          name: service.name,
          description: service.description,
          status: service.status || 'operational',
          uptime: {
            '24h': service.uptime24h || 100,
            '7d': service.uptime7d || 100,
            '30d': service.uptime30d || 100,
            '90d': service.uptime90d || 100
          },
          responseTime: service.responseTime24h || 0,
          lastCheck: toISOString(service.lastCheck)
        });
        
        return groups;
      }, []),
      // Include incidents if available
      incidents: (data.incidents || []).map((incident: any) => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        status: incident.status || 'investigating',
        severity: incident.severity || 'none',
        createdAt: toISOString(incident.createdAt),
        updatedAt: toISOString(incident.updatedAt),
        resolvedAt: incident.resolvedAt ? toISOString(incident.resolvedAt) : null,
        updates: (incident.updates || []).map((update: any) => ({
          id: update.id,
          status: update.status,
          message: update.message,
          timestamp: toISOString(update.timestamp || update.createdAt)
        })),
        affectedServices: incident.affectedServices || []
      })),
      // Include metrics data
      responseTimeData: data.responseTimeData || [],
      uptimeData: data.uptimeData || []
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
    });

  } catch (error) {
    console.error('Error in /api/status-pages/by-domain:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
