// app/(dashboard)/monitoring/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getAllMonitorsAction } from "./new/action";

interface Monitor {
  id: string;
  url: string;
  status: string;
  uptimeDuration: string;
  lastChecked: string;
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonitors() {
      try {
        const data = await getAllMonitorsAction();
        setMonitors(data || []);
      } catch (err) {
        console.error("Error fetching monitors", err);
      } finally {
        setLoading(false);
      }
    }
    if (typeof window !== "undefined") fetchMonitors();
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Monitors</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <Input className="w-full sm:w-80" placeholder="Search" />
        <Link href="/dashboard/monitoring/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create monitor</Button>
        </Link>
      </div>

      <Card className="w-full max-w-full sm:max-w-3xl">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading monitors...</p>
            ) : monitors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No monitors yet.</p>
            ) : (
              monitors.map((monitor: Monitor) => (
                <Link
                  key={monitor.id}
                  href={`/dashboard/monitoring/${monitor.id}`}
                  className="block"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-2 sm:px-4 border-b cursor-pointer hover:bg-muted rounded-lg transition gap-2 sm:gap-0">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          monitor.status === "up"
                            ? "bg-green-500"
                            : monitor.status === "down"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{monitor.url}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {monitor.status === "up" ? "Up" : "Down"} · {monitor.uptimeDuration}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
                      <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        Last check: {new Date(monitor.lastChecked).toLocaleTimeString()}
                      </span>
                      <Button variant="ghost" size="icon">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 114 0 2 2 0 01-4 0zM10 2a2 2 0 110 4 2 2 0 010-4zm0 12a2 2 0 110 4 2 2 0 010-4z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
