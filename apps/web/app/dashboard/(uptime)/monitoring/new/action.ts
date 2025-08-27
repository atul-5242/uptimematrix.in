
// app/actions/monitor.ts
"use client";

export interface MonitorFormData {
  name: string;
  url: string;
  monitorType: 'http';
  checkInterval: number; // ms
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  regions: string[];
  escalationPolicyId: string;
  tags: string[];
}

export async function getAllMonitorsAction() {
  const nextAppBaseURL = process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000";
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${nextAppBaseURL}/api/uptime/getallmonitors`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch monitors");
  }
  const data = await res.json();
  console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from getallmonitorsAction", data);
  const websites = data?.monitors?.monitors?.websites || [];

  return websites.map((w: any) => ({
    id: w.id,
    name: w.name || w.url,
    url: w.url,
    type: w.monitorType || "http", //-
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
}

export async function createMonitorAction(data: MonitorFormData) {
  try {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("/api/uptime/monitor", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create monitor");
    }

    return res.json();
  } catch (err: any) {
    throw err;
  }
}

export async function getWebsiteStatusAction(websiteId: string) {
  const res = await fetch(`/api/uptime/monitor/${websiteId}`, {
    method: "GET",
    credentials: "include", // if using cookies/session
  });
  console.log("res>>>>>>>>>>>>>>>>>>>>>>>>>>", res);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch website");
  }

  const data = await res.json();
  console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------", data.data);
  // Transform API -> UI format
  return {
    id: data.data.id,
    incidents: 0, // backend doesn’t send yet
    lastChecked: new Date().toISOString(), // backend doesn’t send, so fake for now
    responseData: data.data.ticks
    ? data.data.ticks.map((tick: any) => ({
        time: new Date(tick.createdAt).toLocaleTimeString(),
        ms: tick.response_time_ms,
      }))
      : [],
    status: data.data.status?.toLowerCase() === "online"
      ? "up"
      : data.status?.toLowerCase() === "offline"
        ? "down"
        : "unknown",

        uptimeDuration: "3 days 4 hrs", // backend doesn’t send yet → static placeholder
        url: data.data.url,
  };
}
