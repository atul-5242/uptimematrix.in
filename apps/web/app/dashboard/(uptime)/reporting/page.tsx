"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type ReportData = {
  metric: string;
  value: string | number;
};

const mockSummary: ReportData[] = [
  { metric: "Total Incidents", value: 24 },
  { metric: "Average Response Time", value: "15m 30s" },
  { metric: "Uptime", value: "99.97%" },
  { metric: "Alerts Sent", value: 58 },
];

const mockReportRows = [
  { date: "2025-08-01", incidents: 3, responseTime: "12m", uptime: "99.9%" },
  { date: "2025-08-02", incidents: 0, responseTime: "-", uptime: "100%" },
  { date: "2025-08-03", incidents: 1, responseTime: "20m", uptime: "99.8%" },
  { date: "2025-08-04", incidents: 4, responseTime: "14m", uptime: "99.6%" },
];

export default function ReportingPage() {
  const [reportType, setReportType] = useState("daily");
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-04");

  // Filter or fetch real report data here based on reportType and dates

  return (
    <div className="min-h-screen bg-background py-12 px-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Reporting</h1>

      {/* Filters */}
      <Card className="w-full max-w-4xl mb-8">
        <CardContent className="flex flex-col sm:flex-row gap-6 justify-between items-end">
          <div className="flex flex-col w-full sm:w-auto">
            <Label htmlFor="report-type" className="mb-1">
              Report Type
            </Label>
            <Select value={reportType} onValueChange={(val) => setReportType(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-auto">
            <Label htmlFor="start-date" className="mb-1">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col w-full sm:w-auto">
            <Label htmlFor="end-date" className="mb-1">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button
            onClick={() => alert(`Generating ${reportType} report from ${startDate} to ${endDate}`)}
          >
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="w-full max-w-4xl mb-8">
        <CardContent className="flex flex-wrap justify-around gap-6">
          {mockSummary.map(({ metric, value }) => (
            <div key={metric} className="text-center">
              <div className="text-muted-foreground text-sm">{metric}</div>
              <div className="text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card className="w-full max-w-4xl overflow-auto">
        <CardContent>
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-muted">
                <th className="py-2 px-4 w-1/4">Date</th>
                <th className="py-2 px-4 w-1/4">Incidents</th>
                <th className="py-2 px-4 w-1/4">Avg Response Time</th>
                <th className="py-2 px-4 w-1/4">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {mockReportRows.map(({ date, incidents, responseTime, uptime }) => (
                <tr key={date} className="border-b border-muted hover:bg-muted">
                  <td className="py-2 px-4">{date}</td>
                  <td className="py-2 px-4">{incidents}</td>
                  <td className="py-2 px-4">{responseTime}</td>
                  <td className="py-2 px-4">{uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
