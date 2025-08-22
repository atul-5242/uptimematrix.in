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
  lastChecked: string;
  uptimeDuration: string;
  incidents: number;
  responseData: { time: string; ms: number }[];
}

export default function MonitorPage() {
  const params = useParams();
  const websiteId = params.websiteId_monitor as string;

  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<WebsiteData | null>(null);

  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date("2025-08-04")
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    new Date("2025-08-18")
  );

  // Fetch website status
  useEffect(() => {
    async function fetchStatus() {
      try {
        console.log("websiteId", websiteId);
        const data = await getWebsiteStatusAction(websiteId);
        console.log(" data", data);
        setWebsite(data);
      } catch (err) { 
        console.error("Failed to fetch website:", err);
      } finally {
        setLoading(false);
      }
    }
    if (websiteId) fetchStatus();
  }, [websiteId]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!website) {
    return <div className="p-8">Website not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8">
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
              {website.status === "up" ? "up": website.status === "down"?"Down":"Unknown"} • Checked every 3
              minutes
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
                {format(new Date(website.lastChecked), "PPPpp")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incidents</p>
              <p className="text-lg font-medium">{website.incidents}</p>
            </div>
          </div>
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
            <span className="text-sm font-medium">Europe</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={website.responseData}>
                <XAxis dataKey="time" />
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
        </CardContent>
      </Card>
    </div>
  );
}
