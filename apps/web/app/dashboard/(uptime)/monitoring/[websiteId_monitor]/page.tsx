// app/(dashboard)/monitor/[monitorId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Bell,
  AlertCircle,
  Pause,
  Settings,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getWebsiteStatusAction } from "../new/action";

interface WebsiteData {
  id: string;
  url: string;
  status: string;
  lastChecked: string | null;
  uptimeDuration: string;
  incidents: number;
  responseData: { time: string; ms: number }[];
  // New fields from backend
  checkInterval?: number;
  method?: string;
  monitorType?: string;
  regions?: string[];
  tags?: string[];
}

export default function MonitorPage() {
  const params = useParams();
  const websiteId = params.websiteId_monitor as string;

  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date("2025-08-04")
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    new Date("2025-08-18")
  );

  const [clientLastChecked, setClientLastChecked] = useState<string | null>(null);

  // Fetch website status
  useEffect(() => {
    let isMounted = true;
    
    async function fetchStatus() {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        if (!websiteId) {
          throw new Error("Website ID is missing from URL");
        }
        
        console.log("🔍 Fetching website with ID:", websiteId);
        
        const data = await getWebsiteStatusAction(websiteId);
        
        if (!isMounted) return;
        
        console.log("✅ Website data received:", data);
        
        // Validate the data structure
        if (!data || !data.id || !data.url) {
          throw new Error("Invalid website data received from server");
        }
        
        setWebsite(data);
      } catch (err: any) { 
        if (!isMounted) return;
        
        console.error("❌ Failed to fetch website:", err);
        setError(err.message || "Failed to fetch website details");
        setWebsite(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    if (websiteId) {
      fetchStatus();
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [websiteId]); // Remove params dependency to prevent unnecessary re-renders

  useEffect(() => {
    if (website?.lastChecked) {
      setClientLastChecked(website.lastChecked);
    }
  }, [website]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading website details...</p>
            <p className="text-sm text-gray-500 mt-2">Website ID: {websiteId}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Website</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Website ID: {websiteId}</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Website Not Found</h2>
          <p className="text-gray-600 mb-4">The website you're looking for could not be found.</p>
          <p className="text-sm text-gray-500">Website ID: {websiteId}</p>
        </div>
      </div>
    );
  }

  return (
    <div key={websiteId} className="min-h-screen bg-background text-foreground p-8 space-y-8">
      {/* Monitor Overview */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  website.status === "up" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {website.url}
            </CardTitle>
            <CardDescription>
              {website.status === "up" ? "Online" : website.status === "down" ? "Offline" : "Unknown"} • 
              Checked every {website.checkInterval ? Math.round(website.checkInterval / 1000) : 60} seconds
              {website.method && ` • ${website.method} method`}
              {website.monitorType && ` • ${website.monitorType.toUpperCase()}`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-1" />
              Send test alert
            </Button>
            <Button variant="outline" size="sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Incidents
            </Button>
            <Button variant="outline" size="sm">
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Currently up for</p>
              <p className="text-lg font-medium">{website.uptimeDuration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last checked at</p>
              <p className="text-lg font-medium">
                {clientLastChecked ? format(new Date(clientLastChecked), "PPPpp") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incidents</p>
              <p className="text-lg font-medium">{website.incidents}</p>
            </div>
          </div>
          
          {/* Additional website details */}
          {(website.regions || website.tags) && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {website.regions && website.regions.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Monitoring Regions</p>
                    <div className="flex flex-wrap gap-2">
                      {website.regions.map((region, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {website.tags && website.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {website.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Times */}
      <Card>
        <CardHeader>
          <CardTitle>Response times</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="day" className="mb-4">
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 mb-2">
            <img src="/flags/eu.svg" alt="Europe" className="w-5 h-5" />
            <span className="text-sm font-medium">
              {website.regions && website.regions.length > 0 
                ? website.regions.join(", ") 
                : "India"
              }
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={website.responseData}>
                <XAxis 
                  dataKey="time"
                  tickFormatter={(isoString) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ms"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Configuration</CardTitle>
          <CardDescription>Current settings for this monitor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Check Interval</p>
              <p className="text-lg font-medium">
                {website.checkInterval ? Math.round(website.checkInterval / 1000) : 60}s
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">HTTP Method</p>
              <p className="text-lg font-medium">{website.method || "GET"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monitor Type</p>
              <p className="text-lg font-medium">{website.monitorType || "HTTPS"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-medium">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    website.status === "up" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {website.status === "up" ? "Online" : website.status === "down" ? "Offline" : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability (static for now) */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Time period</th>
                  <th className="p-2 text-left">Availability</th>
                  <th className="p-2 text-left">Downtime</th>
                  <th className="p-2 text-left">Incidents</th>
                  <th className="p-2 text-left">Longest incident</th>
                  <th className="p-2 text-left">Avg. incident</th>
                </tr>
              </thead>
              <tbody>
                {/* You can later populate this with real data */}
                <tr className="border-b">
                  <td className="p-2">Today</td>
                  <td className="p-2">100.0000%</td>
                  <td className="p-2">none</td>
                  <td className="p-2">0</td>
                  <td className="p-2">none</td>
                  <td className="p-2">none</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Separator className="my-4" />

          {/* Date Range Pickers */}
          <div className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "LLL dd, y") : <span>From</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "LLL dd, y") : <span>To</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button>Calculate</Button>
          </div>

          <p className="mt-4 text-muted-foreground text-xs">
            Need help? Contact us at{" "}
            <span className="underline">atul.fzdlko2002@gmail.com</span>
          </p>
          
          {/* Debug Information - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Website ID: {website.id}</p>
                <p>Status: {website.status}</p>
                <p>Check Interval: {website.checkInterval}ms</p>
                <p>Method: {website.method}</p>
                <p>Monitor Type: {website.monitorType}</p>
                <p>Regions: {website.regions?.join(", ") || "None"}</p>
                <p>Tags: {website.tags?.join(", ") || "None"}</p>
                <p>Response Data Points: {website.responseData.length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
