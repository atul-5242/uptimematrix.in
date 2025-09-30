import { prismaClient } from "@uptimematrix/store";
import type { Request, Response } from "express";
import { StatusPageStatus, StatusPageVisibility, Prisma } from "@prisma/client";

export const getMonitorsForStatusPage = async (req: Request, res: Response) => {
  try {
    // Get monitors for the current user's organization with the latest tick
    const websites = await prismaClient.website.findMany({
      where: { 
        organizationId: req.user.organizationId!,
      },
      include: {
        ticks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { 
        name: 'asc' 
      }
    });

    // Format the response to match what the frontend expects
    const monitors = websites.map(website => {
      const latestTick = website.ticks[0];
      
      return {
        id: website.id,
        name: website.name || website.url,
        url: website.url,
        status: latestTick?.status?.toLowerCase() || 'unknown',
        lastCheck: latestTick?.createdAt || null,
        responseTime: latestTick?.response_time_ms || 0,
        uptime: 0 // We'll calculate this if needed
      };
    });

    res.status(200).json({
      success: true,
      data: monitors
    });

  } catch (error) {
    console.error('Error fetching monitors for status page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitors for status page',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

interface ServiceForm {
  id: string;
  name: string;
  monitorId: string;
}

interface ServiceGroupForm {
  id: string;
  name: string;
  services: ServiceForm[];
}

interface CreateStatusPageRequest {
  name: string;
  description?: string;
  subdomain?: string;
  customDomain?: string;
  visibility?: 'public' | 'private';
  theme?: string;
  primaryColor?: string;
  headerBg?: string;
  serviceGroups?: ServiceGroupForm[];
  notifications?: {
    email?: boolean;
    slack?: boolean;
    webhook?: boolean;
    sms?: boolean;
  };
  customizations?: {
    showUptime?: boolean;
    showIncidents?: boolean;
    showMetrics?: boolean;
    allowSubscriptions?: boolean;
    customCSS?: string;
    customHTML?: string;
  };
}

export const getAllStatusPages = async (req: Request, res: Response) => {
  try {
    // First, get all status pages for the organization with service groups and services
    const statusPages = await prismaClient.statusPage.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
      include: {
        services: {
          include: {
            services: true
          }
        },
        organization: {
          select: {
            name: true
          }
        },
        createdBy: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get incident counts for each status page
    const statusPageIds = statusPages.map(page => page.id);
    
    // Get all service groups for the status pages with their services
    const serviceGroups = await prismaClient.serviceGroup.findMany({
      where: {
        statusPageId: {
          in: statusPageIds
        }
      },
      include: {
        services: true
      }
    });

    // Count services and create a map of status page ID to service count
    const serviceCountMap = serviceGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.statusPageId] = (acc[group.statusPageId] || 0) + (group.services?.length || 0);
      return acc;
    }, {});

    // Get all incidents for the organization
    const incidents = await prismaClient.incident.findMany({
      where: {
        organizationId: req.user.organizationId,
        serviceId: {
          in: serviceGroups.flatMap(group => group.services.map(s => s.id))
        }
      },
      select: {
        serviceId: true
      }
    });

    // Create a map of service ID to status page ID
    const serviceToPageMap = serviceGroups.reduce<Record<string, string>>((acc, group) => {
      group.services.forEach(service => {
        if (service.id) {
          acc[service.id] = group.statusPageId;
        }
      });
      return acc;
    }, {});

    // Count incidents per status page
    const incidentCountMap = incidents.reduce<Record<string, number>>((acc, incident) => {
      if (incident.serviceId) {
        const pageId = serviceToPageMap[incident.serviceId];
        if (pageId) {
          acc[pageId] = (acc[pageId] || 0) + 1;
        }
      }
      return acc;
    }, {});

    // Format the response
    const formattedStatusPages = await Promise.all(statusPages.map(async (page: any) => {
      // Calculate total services count and average uptime
      let totalServices = 0;
      let totalUptime = 0;
      let serviceCount = 0;
      
      // Process each service group and its services
      const services = page.serviceGroups.flatMap((group: any) => {
        const groupServices = group.services.map((service: any) => {
          totalServices++;
          totalUptime += service.uptime || 0;
          serviceCount++;
          
          return {
            id: service.id,
            name: service.name,
            status: service.status.toLowerCase(),
            uptime: service.uptime,
            monitorId: service.monitorId || ''
          };
        });

        return groupServices.length > 0 ? [{
          id: group.id,
          name: group.name,
          status: group.status.toLowerCase(),
          services: groupServices
        }] : [];
      });
      
      const avgUptime = serviceCount > 0 ? (totalUptime / serviceCount) : 100;
      const incidentCount = incidentCountMap[page.id] || 0;
      
      return {
        id: page.id,
        name: page.name,
        subdomain: page.subdomain,
        customDomain: page.customDomain || null,
        description: page.description,
        status: page.status.toLowerCase(),
        visibility: page.visibility.toLowerCase(),
        services,
        subscribers: 0, // TODO: Implement subscriber count if needed
        incidents: incidentCount,
        uptime: parseFloat(avgUptime.toFixed(2)),
        isPublished: page.isPublished,
        theme: page.theme || 'light',
        branding: {
          primaryColor: page.primaryColor || '#3b82f6',
          headerBg: page.headerBg || '#ffffff',
          logo: page.logo || ''
        },
        organization: {
          id: page.organizationId,
          name: page.organization?.name || ''
        },
        createdBy: {
          id: page.createdById,
          name: page.createdBy?.fullName || page.createdBy?.email || 'Unknown'
        },
        lastUpdated: page.lastUpdated.toISOString(),
        createdAt: page.createdAt.toISOString()
      };
    }));

    res.status(200).json({
      success: true,
      data: formattedStatusPages
    });

  } catch (error) {
    console.error('Error fetching status pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status pages',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createStatusPage = async (req: Request, res: Response) => {
  console.log('Received status page creation request:', {
    body: req.body,
    user: req.user,
    headers: req.headers
  });
  
  try {
    const { 
      name, 
      description = '',
      subdomain,
      customDomain,
      visibility = 'public',
      theme = 'light',
      primaryColor = '#3b82f6',
      headerBg = '#ffffff',
      serviceGroups = [],
      notifications = { email: false, slack: false, webhook: false, sms: false },
      customizations = {}
    } = req.body as CreateStatusPageRequest;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required for creating a status page'
      });
    }

    // Transform service groups and services to match Prisma schema
    const serviceGroupsData = serviceGroups.map((group: ServiceGroupForm) => ({
      name: group.name,
      status: 'OPERATIONAL' as const, // Use const assertion to match ServiceStatus
      services: {
        create: group.services.map(service => ({
          name: service.name,
          status: 'OPERATIONAL' as const, // Use const assertion to match ServiceStatus
          monitorId: service.monitorId,
          uptime: 100 // Default uptime
        }))
      }
    }));

    // Create the status page with service groups and services
    const statusPage = await prismaClient.statusPage.create({
      data: {
        name,
        description,
        subdomain: subdomain || name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        customDomain: customDomain || null,
        status: StatusPageStatus.OPERATIONAL,
        visibility: StatusPageVisibility[visibility.toUpperCase() as keyof typeof StatusPageVisibility] || StatusPageVisibility.PUBLIC,
        theme,
        primaryColor,
        headerBg,
        organization: {
          connect: { id: req.user.organizationId! }
        },
        createdBy: {
          connect: { id: req.user.id! }
        },
        services: {
          create: serviceGroupsData
        },
        isPublished: true,
        customCSS: customizations.customCSS || '',
        customHTML: customizations.customHTML || ''
      },
      include: {
        services: {
          include: {
            services: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: statusPage
    });

  } catch (error) {
    console.error('Error creating status page:', error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error type:', error);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create status page',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
};
