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
      }
    });

    // Get incident counts for each status page
    const statusPageIds = statusPages.map(page => page.id);
    
    // Get all service groups for the status pages with their services
    const serviceGroups = await prismaClient.serviceGroup.findMany({
      where: {
        statusPageId: {
          in: statusPages.map(p => p.id)
        }
      },
      include: {
        services: true,
        statusPage: {
          select: {
            id: true
          }
        }
      }
    });

    // Count services and create a map of status page ID to service count
    const serviceCountMap = serviceGroups.reduce<Record<string, number>>((acc, group) => {
      const pageId = group.statusPage?.id;
      if (pageId) {
        acc[pageId] = (acc[pageId] || 0) + (group.services?.length || 0);
      }
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
    const formattedStatusPages = statusPages.map((page) => {
      // Calculate total services count and average uptime
      let totalUptime = 0;
      let serviceCount = 0;
      
      // Process each service group and its services
      const serviceGroups = page.services.map((group: any) => {
        const services = group.services.map((service: any) => {
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

        return {
          id: group.id,
          name: group.name,
          status: group.status.toLowerCase(),
          services
        };
      });

      const avgUptime = serviceCount > 0 ? (totalUptime / serviceCount) : 100;

      return {
        id: page.id,
        name: page.name,
        subdomain: page.subdomain,
        customDomain: page.customDomain,
        description: page.description,
        status: page.status,
        visibility: page.visibility,
        services: serviceGroups,
        subscribers: 0, // TODO: Implement subscriber count
        incidents: page.incidents || 0,
        uptime: parseFloat(avgUptime.toFixed(2)),
        isPublished: page.isPublished,
        theme: page.theme || 'light',
        branding: {
          primaryColor: page.primaryColor || '#3b82f6',
          headerBg: page.headerBg || '#ffffff',
          logo: page.logo || ''
        },
        organization: page.organization,
        createdBy: page.createdBy,
        lastUpdated: page.lastUpdated.toISOString(),
        createdAt: page.createdAt.toISOString()
      };
    });

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
        customHTML: customizations.customHTML || '',
        lastUpdated: new Date() // Explicitly set lastUpdated to current date
      } as Prisma.StatusPageCreateInput,
      include: {
        services: {
          include: {
            services: true
          }
        }
      }
    });

    // Trigger Nginx provisioning if custom domain is provided
    if (customDomain) {
      try {
        const { exec } = require('child_process');
        exec(`sudo /usr/local/bin/provision_custom_domain.sh ${customDomain}`, (err: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
          if (err) {
            console.error('Error provisioning custom domain:', err, stderr);
          } else {
            console.log('Custom domain provisioned:', stdout);
          }
        });
      } catch (error) {
        console.error('Failed to execute domain provisioning script:', error);
      }
    }

    res.status(201).json({
      success: true,
      id: statusPage.id,
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


export const getStatusPageByDomain = async (req: Request, res: Response) => {
  try {
    const { domain } = req.query;
    
    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain parameter is required' });
    }
    
    // 1. Find status page by custom domain or subdomain
    const statusPage = await prismaClient.statusPage.findFirst({
      where: {
        OR: [
          { customDomain: domain as string },
          { subdomain: (domain as string).split('.')[0] }
        ]
      },
      include: {
        services: {
          include: {
            services: true
          }
        }
      }
    });
    
    if (!statusPage) {
      return res.status(404).json({ success: false, message: 'Status page not found' });
    }

    // 2. Extract all monitor IDs from services
    const monitorIds: string[] = [];
    statusPage.services.forEach(group => {
      group.services.forEach(service => {
        if (service.monitorId) {
          monitorIds.push(service.monitorId);
        }
      });
    });

    // 3. Fetch monitors with latest tick data
    const monitors = await prismaClient.website.findMany({
      where: { id: { in: monitorIds } },
      include: {
        ticks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Create a map of monitorId -> monitor data for quick lookup
    const monitorMap = new Map(monitors.map(m => [m.id, m]));

    // 4. Fetch 90-day tick history for uptime calculations
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const tickHistory = await prismaClient.websiteTick.findMany({
      where: {
        website_id: { in: monitorIds },
        createdAt: { gte: ninetyDaysAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Define type for tick object
    interface WebsiteTick {
      website_id: string;
      // Add other properties that tick might have
      [key: string]: any;
    }

    // Group ticks by website_id for easier processing
    const ticksByMonitor = tickHistory.reduce<Record<string, WebsiteTick[]>>((acc, tick) => {
      if (!tick.website_id) return acc; // Skip if website_id is missing
      if (!acc[tick.website_id]) {
        acc[tick.website_id] = [];
      }
      acc[tick.website_id]?.push(tick);
      return acc;
    }, {} as Record<string, WebsiteTick[]>);

    // 5. Fetch last 24 hours of ticks for response time chart
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTicks = await prismaClient.websiteTick.findMany({
      where: {
        website_id: { in: monitorIds },
        createdAt: { gte: twentyFourHoursAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    // 6. Fetch incidents related to this organization
    const incidents = await prismaClient.incident.findMany({
      where: {
        organizationId: statusPage.organizationId,
        websiteId: { in: monitorIds }
      },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20 incidents
    });

    // 7. Calculate metrics and format response
    let totalUptime = 0;
    let totalResponseTime = 0;
    let serviceCount = 0;
    let totalChecks = 0;

    const formattedServiceGroups = statusPage.services.map(group => {
      const formattedServices = group.services.map(service => {
        const monitor = service.monitorId ? monitorMap.get(service.monitorId) : null;
        const latestTick = monitor?.ticks[0];
        const serviceTicks = service.monitorId ? ticksByMonitor[service.monitorId] || [] : [];

        // Calculate uptime percentage for this service
        const onlineTicks = serviceTicks.filter(t => t.status === 'Online').length;
        const uptimePercentage = serviceTicks.length > 0 
          ? (onlineTicks / serviceTicks.length) * 100 
          : 100;

        // Calculate 90-day uptime history (group by day)
        const uptimeHistory: Array<{ date: string; uptime: number; status: string }> = [];
        for (let i = 0; i < 90; i++) {
          const date = new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000);
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));
          
          const dayTicks = serviceTicks.filter(t => {
            const tickDate = new Date(t.createdAt);
            return tickDate >= dayStart && tickDate <= dayEnd;
          });

          const dayOnline = dayTicks.filter(t => t.status === 'Online').length;
          const dayUptime = dayTicks.length > 0 ? (dayOnline / dayTicks.length) * 100 : 100;
          
          if (dayStart) {
            uptimeHistory.push({
              date: dayStart?.toISOString().split('T')[0] ?? '',
              uptime: parseFloat(dayUptime.toFixed(2)),
              status: dayUptime >= 99 ? 'operational' : 'down'
            });
          }
        }

        // Aggregate for overall metrics
        totalUptime += uptimePercentage;
        totalResponseTime += latestTick?.response_time_ms || 0;
        serviceCount++;
        totalChecks += serviceTicks.length;

        return {
          id: service.id,
          name: service.name,
          description: service.description || '',
          status: latestTick?.status === 'Online' ? 'operational' : 'down',
          uptime: parseFloat(uptimePercentage.toFixed(2)),
          responseTime: latestTick?.response_time_ms || 0,
          lastCheck: latestTick?.createdAt?.toISOString() || new Date().toISOString(),
          uptimeHistory
        };
      });

      return {
        id: group.id,
        name: group.name,
        status: group.status === 'OPERATIONAL' ? 'operational' : 'down',
        services: formattedServices
      };
    });

    // 8. Calculate overall metrics
    const overallUptime = serviceCount > 0 ? totalUptime / serviceCount : 100;
    const avgResponseTime = serviceCount > 0 ? Math.round(totalResponseTime / serviceCount) : 0;

    // 9. Format response time data (last 24 hours, grouped by hour)
    const responseTimeData: Array<{ time: string; responseTime: number }> = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
      const hourStart = new Date(hour.setMinutes(0, 0, 0));
      const hourEnd = new Date(hour.setMinutes(59, 59, 999));
      
      const hourTicks = recentTicks.filter(t => {
        const tickDate = new Date(t.createdAt);
        return tickDate >= hourStart && tickDate <= hourEnd;
      });

      const avgRt = hourTicks.length > 0
        ? Math.round(hourTicks.reduce((sum, t) => sum + t.response_time_ms, 0) / hourTicks.length)
        : 0;

      responseTimeData.push({
        time: `${String(hour.getHours()).padStart(2, '0')}:00`,
        responseTime: avgRt
      });
    }

    // 10. Format uptime data (last 30 days)
    const uptimeData: Array<{ date: string; uptime: number }> = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTicks = tickHistory.filter(t => {
        const tickDate = new Date(t.createdAt);
        return tickDate >= dayStart && tickDate <= dayEnd;
      });

      const dayOnline = dayTicks.filter(t => t.status === 'Online').length;
      const dayUptime = dayTicks.length > 0 ? (dayOnline / dayTicks.length) * 100 : 100;
      
      uptimeData.push({
        date: dayStart?.toISOString().split('T')[0] ?? '',
        uptime: parseFloat(dayUptime.toFixed(2))
      });
    }

    // 11. Format incidents
    const formattedIncidents = incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.impact || '',
      status: incident.status.toLowerCase() as 'investigating' | 'identified' | 'monitoring' | 'resolved',
      severity: incident.severity === 'CRITICAL' ? 'critical' : 
                incident.severity === 'MAJOR' ? 'major' : 'minor',
      createdAt: incident.createdAt.toISOString(),
      updatedAt: incident.createdAt.toISOString(),
      resolvedAt: incident.endTime?.toISOString(),
      updates: incident.updates.map(update => ({
        id: update.id,
        status: update.type,
        message: update.message,
        timestamp: update.createdAt.toISOString()
      })),
      affectedServices: incident.websiteId ? [incident.websiteId] : []
    }));

    // 12. Build final response
    const response = {
      id: statusPage.id,
      name: statusPage.name,
      description: statusPage.description,
      status: 'operational' as const, // Calculate from services if needed
      lastUpdated: statusPage.lastUpdated.toISOString(),
      logo: statusPage.logo || undefined,
      branding: {
        primaryColor: statusPage.primaryColor,
        headerBg: statusPage.headerBg
      },
      serviceGroups: formattedServiceGroups,
      incidents: formattedIncidents,
      metrics: {
        overallUptime: parseFloat(overallUptime.toFixed(2)),
        avgResponseTime,
        totalChecks
      },
      uptimeData,
      responseTimeData
    };
    
    res.json({ success: true, data: response });
    
  } catch (error) {
    console.error('Error fetching status page by domain:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const provisionCustomDomain = async (req: Request, res: Response) => {
  try {
    const { domain,subdomain } = req.body;
    const { id } = req.params;
    if(!id) {
      return res.status(400).json({ success: false, message: 'Status page ID is required' });
    }

    // Verify status page exists and user has access
    const statusPage = await prismaClient.statusPage.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      }
    });
    
    if (!statusPage) {
      return res.status(404).json({ success: false, message: 'Status page not found' });
    }
    
    // Execute provisioning script for custom domain
    if (domain) {
      const { exec } = require('child_process');
      exec(`sudo /usr/local/bin/provision_custom_domain.sh ${domain}`, async (err: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
        if (err) {
          console.error('Custom domain provisioning failed:', err, stderr);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to provision custom domain',
            error: stderr.toString()
          });
        }
        
        try {
          // Update database with custom domain without affecting subdomain
          const updatedPage = await prismaClient.statusPage.update({
            where: { id },
            data: { 
              customDomain: domain
              // Keep the existing subdomain
            },
            select: {
              id: true,
              subdomain: true,
              customDomain: true
            }
          });
          
          res.json({ 
            success: true, 
            message: 'Custom domain provisioned successfully',
            data: updatedPage
          });
        } catch (error: unknown) {
          const dbError = error as Error;
          console.error('Database update failed:', dbError);
          res.status(500).json({ 
            success: false, 
            message: 'Domain provisioned but failed to update database',
            error: dbError.message 
          });
        }
      });
      return; // Return to prevent further execution
    }
    if (subdomain) {
      const { exec } = require('child_process');
      exec(`sudo /usr/local/bin/provision_custom_domain.sh ${subdomain}.status.uptimematrix.atulmaurya.in`, async (err: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
        if (err) {
          console.error('Subdomain provisioning failed:', err, stderr);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to provision subdomain',
            error: stderr.toString()
          });
        }
        
        try {
          // Update database with subdomain without affecting custom domain
          const updatedPage = await prismaClient.statusPage.update({
            where: { id },
            data: { 
              subdomain: subdomain
              // Keep the existing custom domain
            },
            select: {
              id: true,
              subdomain: true,
              customDomain: true
            }
          });
          
          res.json({ 
            success: true, 
            message: 'Subdomain provisioned successfully',
            data: updatedPage
          });
        } catch (error: unknown) {
          const dbError = error as Error;
          console.error('Database update failed:', dbError);
          res.status(500).json({ 
            success: false, 
            message: 'Subdomain provisioned but failed to update database',
            error: dbError.message 
          });
        }
      });
    }
  } catch (error) {
    console.error('Error in domain provisioning:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}