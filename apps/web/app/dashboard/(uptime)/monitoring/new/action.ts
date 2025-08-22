
// app/actions/monitor.ts
"use client";

export interface MonitorFormData {
  url: string;
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
    // credentials: "include", // Not needed when manually setting Authorization header
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch monitors");
  }

  const data = await res.json();
  console.log("res>>>>>>>>>>>>>>>>>>>>>>>>>>", data);

  // Correct shape based on your backend
  const websites = data?.monitors?.websites || [];

  return websites.map((w: any) => ({
    id: w.id,
    url: w.url,
    status: w.status?.toLowerCase() || "unknown",
    uptimeDuration: "3d 4h", // placeholder, calculate if needed
    lastChecked: w.lastCheckedAt || new Date().toISOString(),
  }));
}

export async function createMonitorAction(data: MonitorFormData) {
  try {
    const token = localStorage.getItem("auth_token"); // Get token for createMonitorAction

    const res = await fetch("/api/uptime/monitor", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      // credentials: "include", // Not needed when manually setting Authorization header
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create monitor");
    }

    return res.json(); // revalidatePath is in the API route
  } catch (err: any) {
    // Re-throw the error as it already contains the message from the API.
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
  console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>", data.data.url);
  // Transform API -> UI format
  return {
    id: data.data.id,
    incidents: 0, // backend doesn’t send yet
    lastChecked: new Date().toISOString(), // backend doesn’t send, so fake for now
    responseData: data.ticks
    ? data.ticks.map((tick: any) => ({
        time: new Date(tick.createdAt).toLocaleTimeString(),
        ms: tick.response_time_ms,
      }))
      : [],
    status: data.status?.toLowerCase() === "online"
      ? "up"
      : data.status?.toLowerCase() === "offline"
        ? "down"
        : "unknown",

        uptimeDuration: "3 days 4 hrs", // backend doesn’t send yet → static placeholder
        url: data.data.url,
  };
}
