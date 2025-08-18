"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type Incident = {
  id: string;
  title: string;
  status: "Open" | "Investigating" | "Resolved";
  priority: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
  description: string;
};

const sampleIncidents: Incident[] = [
  {
    id: "INC-1001",
    title: "Database connectivity issue",
    status: "Investigating",
    priority: "High",
    createdAt: "2025-08-14T14:12:00Z",
    description:
      "Detected intermittent connectivity issues in the primary database cluster causing slow application responses.",
  },
  {
    id: "INC-0921",
    title: "API latency spike",
    status: "Open",
    priority: "Medium",
    createdAt: "2025-08-15T09:30:00Z",
    description: "API response times exceeding acceptable thresholds, affecting user experience.",
  },
  {
    id: "INC-0877",
    title: "Email service outage",
    status: "Resolved",
    priority: "Critical",
    createdAt: "2025-08-12T22:05:00Z",
    description: "Outage of the transactional email service due to third-party provider downtime.",
  },
];

export default function IncidentPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Incident["status"] | "All">("All");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = sampleIncidents.filter((incident) => {
    const matchesQuery =
      incident.title.toLowerCase().includes(query.toLowerCase()) ||
      incident.id.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === "All" || incident.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Incident List Section */}
        <section className="md:w-2/5 space-y-6">
          <h1 className="text-3xl font-bold mb-4">Incident Management</h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Input
              placeholder="Search by Incident ID or title"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow"
            />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as Incident["status"] | "All")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Investigating">Investigating</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="max-h-[600px] overflow-auto">
            <CardContent className="p-0">
              {filteredIncidents.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">No incidents found.</div>
              )}

              <ul>
                {filteredIncidents.map((incident) => (
                  <li
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`cursor-pointer p-4 border-b hover:bg-muted ${
                      selectedIncident?.id === incident.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{incident.title}</div>
                      <Badge
                        variant={
                          incident.status === "Open"
                            ? "destructive"
                            : incident.status === "Investigating"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {incident.id} &middot; Priority:{" "}
                      <span
                        className={`font-semibold ${
                          incident.priority === "Critical"
                            ? "text-red-600"
                            : incident.priority === "High"
                            ? "text-orange-600"
                            : incident.priority === "Medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {incident.priority}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(incident.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Incident Detail Section */}
        <section className="md:w-3/5">
          {selectedIncident ? (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="text-2xl font-bold">{selectedIncident.title}</h2>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      selectedIncident.status === "Open"
                        ? "destructive"
                        : selectedIncident.status === "Investigating"
                        ? "warning"
                        : "outline"
                    }
                  >
                    {selectedIncident.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-semibold">
                    Priority: {selectedIncident.priority}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Created: {new Date(selectedIncident.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-muted-foreground whitespace-pre-wrap">
                  {selectedIncident.description}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <Button variant="default" onClick={() => alert("Mark as resolved flow here")}>
                    Mark as Resolved
                  </Button>
                  <Button variant="destructive" onClick={() => alert("Close incident flow here")}>
                    Close Incident
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed border-muted rounded-md">
              Select an incident to view details.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
