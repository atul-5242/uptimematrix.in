import { prismaClient } from "@uptimematrix/store";
import type { Request, Response } from "express";
import { StatusPageStatus, StatusPageVisibility } from "@prisma/client";

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
