// app/actions/monitor.ts
"use client";
import axios from "axios";

export interface MonitorFormData {
  url: string;
}

export async function createMonitorAction(data: MonitorFormData) {
  try {
    const res = await axios.post("/api/uptime/monitor", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Failed to create monitor");
  }
}

export async function getWebsiteStatusAction(websiteId: string) {
  try {
    const res = await axios.get(`/api/uptime/monitor/${websiteId}`);
    return res.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Failed to fetch website status");
  }
}
