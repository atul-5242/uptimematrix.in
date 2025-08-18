"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; // ✅ consistent date formatting

type Heartbeat = {
  id: string;
  name: string;
  lastHeartbeat: string; // ISO timestamp
  status: "Healthy" | "Missed" | "Warning";
};

const initialHeartbeats: Heartbeat[] = [
  {
    id: "hb1",
    name: "API Server Heartbeat",
    lastHeartbeat: "2025-08-17T10:23:00Z",
    status: "Healthy",
  },
  {
    id: "hb2",
    name: "Worker Process Heartbeat",
    lastHeartbeat: "2025-08-17T10:20:00Z",
    status: "Missed",
  },
  {
    id: "hb3",
    name: "Database Sync Heartbeat",
    lastHeartbeat: "2025-08-17T10:22:30Z",
    status: "Warning",
  },
];

export default function HeartbeatMonitorPage() {
  const [heartbeats, setHeartbeats] = useState(initialHeartbeats);
  const [loading, setLoading] = useState(false);

  const refreshHeartbeats = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate fetching updated heartbeat data
      setHeartbeats((current) =>
        current.map((hb) => ({
          ...hb,
          lastHeartbeat: new Date().toISOString(),
          status: Math.random() > 0.8 ? "Missed" : "Healthy",
        }))
      );
      setLoading(false);
    }, 1000);
  };

  const statusVariant = (status: Heartbeat["status"]) => {
    switch (status) {
      case "Healthy":
        return "success";
      case "Warning":
        return "warning";
      case "Missed":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Heartbeat Monitoring</h1>

      <Card className="w-full max-w-3xl">
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">Active Heartbeats</div>
            <Button onClick={refreshHeartbeats} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="divide-y divide-muted overflow-auto max-h-[600px]">
            {heartbeats.map((hb) => (
              <div
                key={hb.id}
                className="flex justify-between py-3 items-center"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{hb.name}</span>
                  <span className="text-xs text-muted-foreground">
                      Last heartbeat:{" "}
                    {format(new Date(hb.lastHeartbeat), "yyyy-MM-dd HH:mm:ss")}
                  </span>
                </div>
                <Badge variant={statusVariant(hb.status)}>{hb.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
