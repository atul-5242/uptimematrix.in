"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const integrationsData = [
  {
    name: "Slack",
    description: "Get channel notifications for incidents and status updates.",
    connected: true,
    configFields: [
      { label: "Channel Name", placeholder: "#incidents" },
    ]
  },
  {
    name: "Microsoft Teams",
    description: "Post updates to your Teams channels automatically.",
    connected: false,
    configFields: [
      { label: "Channel URL", placeholder: "Paste webhook URL" },
    ]
  },
  {
    name: "Email",
    description: "Send alerts to an email address or mailing list.",
    connected: true,
    configFields: [
      { label: "Recipient Email", placeholder: "alerts@company.com" },
    ]
  },
  {
    name: "PagerDuty",
    description: "Escalate incidents to PagerDuty schedules.",
    connected: false,
    configFields: [
      { label: "Service Integration Key", placeholder: "Paste integration key" },
    ]
  },
  {
    name: "Webhook",
    description: "Send JSON POST requests to custom endpoints when incidents happen.",
    connected: false,
    configFields: [
      { label: "Webhook URL", placeholder: "https://..." },
    ]
  },
  {
    name: "Opsgenie",
    description: "Send on-call alerts via Opsgenie’s incident platform.",
    connected: false,
    configFields: [
      { label: "API Key", placeholder: "Paste Opsgenie API key" },
    ]
  },
];

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [connectedMap, setConnectedMap] = useState(() =>
    integrationsData.reduce((acc, i) => {
      acc[i.name] = i.connected
      return acc
    }, {} as Record<string, boolean>)
  );

  const filteredIntegrations = integrationsData.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleConnection = (name: string) => {
    setConnectedMap((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Integrations</h1>
        <p className="text-muted-foreground mb-6">
          Connect Better Stack with your favorite tools for real-time alerts, notifications, and incident management.
        </p>

        {/* Search Input */}
        <Input
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 max-w-md"
        />

        {/* Integrations Accordion */}
        <Accordion type="multiple" collapsible>
          {filteredIntegrations.map((integration) => (
            <AccordionItem key={integration.name} value={integration.name}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-base">{integration.name}</span>
                    {connectedMap[integration.name] ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={connectedMap[integration.name] ? "outline" : "default"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleConnection(integration.name);
                    }}
                  >
                    {connectedMap[integration.name] ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="p-6 bg-muted/40 rounded-lg space-y-4">
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      // You can implement your save logic here
                      alert(`Saved configuration for ${integration.name}`);
                    }}
                    className="space-y-4"
                  >
                    {integration.configFields.map((field, idx) => (
                      <div key={idx}>
                        <Label className="mb-1 block">{field.label}</Label>
                        <Input
                          placeholder={field.placeholder}
                          disabled={!connectedMap[integration.name]}
                          required={connectedMap[integration.name]}
                        />
                      </div>
                    ))}
                    <Button type="submit" disabled={!connectedMap[integration.name]}>
                      Save Configuration
                    </Button>
                  </form>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
