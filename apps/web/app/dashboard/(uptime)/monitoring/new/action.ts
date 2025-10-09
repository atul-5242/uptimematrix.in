// app/actions/monitor.ts
"use client";

import { apiRequest, handleApiError, handleApiSuccess } from '@/lib/errorHandler';

export interface MonitorFormData {
  name: string;
  url: string;
  monitorType: 'http';
  checkInterval: number; // ms
  method: 'GET';
  regions: string[];
  escalationPolicyId: string;
  tags: string[];
}

export async function getAllMonitorsAction() {
  try {
    // Always fetch token through our API to avoid stale/localStorage inconsistencies
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Load Monitors');
      throw new Error('Authentication required');
    }

    const result = await apiRequest(`/api/uptime/getallmonitors`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, 'Load Monitors');

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch monitors');
    }
    
    const data = result.data;
    console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from getallmonitorsAction", data);
    const websites = data?.monitors?.monitors?.websites || [];

    return websites.map((w: any) => ({
      id: w.id,
      name: w.name || w.url,
      url: w.url,
      type: w.monitorType || "http",
      checkInterval: w.checkInterval || 60000,
      method: w.method || "GET",
      uptime: w.uptime,
      regions: w.regions || ['us-east-1', 'eu-west-1'],
      escalationPolicyId: w.escalationPolicyId || "",
      tags: w.tags || ["default"],
      status: w.status?.toLowerCase() || "unknown",
      lastCheck: w.lastCheck,
      incidents: w.incidents || 0,
      timeAdded: w.timeAdded || new Date().toISOString(),
      uptimeTrend: w.status?.toLowerCase() === "online" ? "online" : "offline",
      avgResponseTime24h: w.avgResponseTime24h || 0,
      responseTime: w.responseTime || 0,
      isActive: true
    }));
  } catch (error) {
    console.error('Error in getAllMonitorsAction:', error);
    handleApiError('Failed to load monitors', 'Load Monitors');
    throw error;
  }
}

export async function createMonitorAction(data: MonitorFormData) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      handleApiError('Authentication required', 'Create Monitor');
      throw new Error('Authentication required');
    }

    const result = await apiRequest("/api/uptime/monitor", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }, 'Create Monitor');

    if (result.success) {
      handleApiSuccess('Monitor created successfully', 'Create Monitor');
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to create monitor');
    }
  } catch (err: any) {
    if (!err.message.includes('Authentication') && !err.message.includes('Permission')) {
      handleApiError(err.message || 'Network error occurred', 'Create Monitor');
    }
    throw err;
  }
}

export async function getWebsiteStatusAction(websiteId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      handleApiError('Authentication required', 'Load Monitor Details');
      throw new Error('Authentication token not found');
    }

    const result = await apiRequest(`/api/uptime/monitor/${websiteId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, 'Load Monitor Details');
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch website');
    }

    const data = result.data;
    console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------", data.data);
    
    // Transform API -> UI format
    return {
      id: data.data.id,
      incidents: data.data.incidents || 0,
      lastChecked: data.data.lastChecked || null,
      responseData: data.data.ticks
        ? data.data.ticks.map((tick: any) => ({
            time: new Date(tick.createdAt).toISOString(),
            ms: tick.response_time_ms,
          }))
        : [],
      status: data.data.status?.toLowerCase() === "online"
        ? "up"
        : data.data.status?.toLowerCase() === "offline"
          ? "down"
          : "unknown",
      uptimeDuration: "3 days 4 hrs", // backend doesn't send yet → static placeholder
      url: data.data.url,
      // Add new fields that backend now provides
      checkInterval: data.data.checkInterval,
      method: data.data.method,
      monitorType: data.data.monitorType,
      regions: data.data.regions,
      tags: data.data.tags,
    };
  } catch (error) {
    console.error('Error in getWebsiteStatusAction:', error);
    handleApiError('Failed to load monitor details', 'Load Monitor Details');
    throw error;
  }
}