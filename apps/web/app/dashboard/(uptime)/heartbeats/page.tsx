"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function HeartbeatCreationPage() {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Heartbeat name is required.");
      return;
    }
    const intervalNum = parseInt(interval, 10);
    if (isNaN(intervalNum) || intervalNum <= 0) {
      setError("Interval must be a positive number.");
      return;
    }
    setError("");

    // TODO: Add API call or logic to create heartbeat here

    alert(`Heartbeat "${name}" created with interval ${intervalNum} minutes.`);
    // reset form
    setName("");
    setInterval("");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Create New Heartbeat</h1>

      <Card className="w-full max-w-md">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="heartbeat-name" className="mb-1 block">
                Heartbeat Name
              </Label>
              <Input
                id="heartbeat-name"
                placeholder="Enter heartbeat monitor name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="heartbeat-interval" className="mb-1 block">
                Check Interval (minutes)
              </Label>
              <Input
                id="heartbeat-interval"
                placeholder="e.g., 5"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                type="number"
                min={1}
                required
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full">
              Create Heartbeat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
