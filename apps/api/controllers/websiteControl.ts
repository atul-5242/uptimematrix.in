import { prismaClient } from "@uptimematrix/store";
import type { Request, Response } from "express";
import axios from "axios";

export enum WebsiteStatus {
    Online = "Online",
    Offline = "Offline",
    Unknown = "Unknown",
}

export const addWebsite = async (req: Request, res: Response) => {
    const { name, url, monitorType, checkInterval, method, regions, escalationPolicyId, tags } = req.body;

    if (!url || !name) {
        return res.status(411).json({ message: "Name and URL are required" });
    }

    try {
        new URL(url); // validate URL
    } catch {
        return res.status(400).json({ message: "Invalid URL provided" });
    }

    try {
        // 1️⃣ Create website entry
        const website = await prismaClient.website.create({
            data: {
                name,
                url,
                monitorType: monitorType || "http",
                checkInterval: checkInterval || 60000,
                method: method || "GET",
                regions: regions || ["India"],
                escalationPolicyId: escalationPolicyId || null,
                tags: tags || [],
                timeAdded: new Date(),
                nextCheckTime: new Date(Date.now() + 5000), // Set to 5 seconds from now for first monitoring cycle
                user_id: req.userId!, // ✅ correct field name
            },
        });

        // 2️⃣ Immediate first check
        const startTime = Date.now();
        let status: WebsiteStatus = WebsiteStatus.Online;
        let responseTime = 0;

        try {
            const methodLower = (website.method || "GET").toLowerCase() as "get"|"post"|"put"|"delete"|"head"; // ✅ lowercase
            await axios({ url: website.url, method: methodLower, timeout: 10000 });
            responseTime = Date.now() - startTime;
        } catch {
            status = WebsiteStatus.Offline;
            responseTime = 0;
        }

        // 3️⃣ Upsert region(s) and create first tick(s)
        const regionsToUse = website.regions || ["India"];
        for (const r of regionsToUse) {
            const region = await prismaClient.region.upsert({
                where: { name: r },
                update: {},
                create: { name: r },
            });

            await prismaClient.websiteTick.create({
                data: {
                    response_time_ms: responseTime,
                    status,
                    website_id: website.id,  // ✅ Fixed: use correct field name
                    region_id: region.id,    // ✅ Fixed: use correct field name
                },
            });
        }

        // 4️⃣ Update website with first check results and set proper nextCheckTime
        const nextCheckTime = new Date(Date.now() + (website.checkInterval || 60000));
        await prismaClient.website.update({
            where: { id: website.id },
            data: {
                lastChecked: new Date(),
                nextCheckTime: nextCheckTime, // Set proper next check time based on interval
                currently_upForIndays: status === WebsiteStatus.Online ? 1 : 0,
            },
        });

        res.json({
            message: "✅ Website added and first check done",
            id: website.id,
            initialStatus: status,
            nextCheckTime: nextCheckTime.toISOString(),
        });

    } catch (error) {
        console.error("Error creating website:", error);
        res.status(500).json({ message: "Failed to create website" });
    }
};



export const getWebsiteStatus = async (req: Request, res: Response) => {
    const website = await prismaClient.website.findFirst({
      where: { user_id: req.userId!, id: req.params.websiteId },
      include: { ticks: { orderBy: [{ createdAt: "desc" }], take: 20 } }, // fetch more ticks
      orderBy: { timeAdded: "desc" },
    });
  
    if (!website) {
      res.status(409).json({ message: "Website not found" });
      return;
    }
  
    res.json({
      message: "Website status fetched successfully",
      url: website.url,
      status: website.ticks[0]?.status,
      id: website.id,
      userId: website.user_id,
      incidents: website.incidents || 0,
      lastChecked: website.lastChecked || website.timeAdded,
      checkInterval: website.checkInterval,
      method: website.method,
      monitorType: website.monitorType,
      regions: website.regions,
      tags: website.tags,
      ticks: website.ticks.map((t:any) => ({
        response_time_ms: t.response_time_ms,
        createdAt: t.createdAt,
        status: t.status,
      })),
    });
  };
  


// helper to calculate uptime %
function calculateUptime(ticks: any[], hours = 24) {
  if (!ticks.length) return 0;
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentTicks = ticks.filter(t => t.createdAt >= cutoff);

  if (!recentTicks.length) return 0;
  const onlineCount = recentTicks.filter(t => t.status === "Online").length;
  return Number(((onlineCount / recentTicks.length) * 100).toFixed(2));
}

// helper to calculate avg response time
function calculateAvgResponseTime(ticks: any[], hours = 24) {
  if (!ticks.length) return 0;
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentTicks = ticks.filter(t => t.createdAt >= cutoff);

  if (!recentTicks.length) return 0;
  const avg = recentTicks.reduce((sum, t) => sum + t.response_time_ms, 0) / recentTicks.length;
  return Math.round(avg);
}

export const getAllMonitors = async (req: Request, res: Response) => {
  try {
    const websites = await prismaClient.website.findMany({
      where: { user_id: req.userId! },
      include: {
        ticks: {
          orderBy: { createdAt: "desc" },
          take: 100, // last 100 ticks (for uptime/avg calculation)
        },
      },
      orderBy: { timeAdded: "desc" },
    });

    const result = websites.map((w) => {
      const latestTick = w.ticks[0];

      return {
        id: w.id,
        name: w.name || w.url,
        url: w.url,
        type: w.monitorType || "http",
        checkInterval: w.checkInterval,
        method: w.method,
        uptime: calculateUptime(w.ticks, 24), // %
        regions: w.regions || ["us-east-1", "eu-west-1"],
        escalationPolicyId: w.escalationPolicyId || "",
        tags: w.tags || ["default"],
        status: latestTick?.status?.toLowerCase() || "unknown",
        lastCheck: latestTick?.createdAt,
        incidents: w.incidents,
        timeAdded: w.timeAdded,
        uptimeTrend: latestTick?.status === "Online" ? "online" : "offline",
        avgResponseTime24h: calculateAvgResponseTime(w.ticks, 24),
        responseTime: latestTick?.response_time_ms || 0,
        isActive: true, // hardcoded unless you add to schema
      };
    });

    res.json({
      message: "Monitors fetched successfully",
      monitors: { websites: result },
    });

  } catch (err: any) {
    console.error("Error fetching monitors:", err);
    res.status(500).json({ message: "Failed to fetch monitors" });
  }
};


export const deleteWebsite = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    // Check ownership
    const website = await prismaClient.website.findFirst({
      where: {
        id,
        user_id: req.userId!,
      },
    });

    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }

    // Delete inside a transaction
    await prismaClient.$transaction(async (tx) => {
      // 1. Delete related ticks
      await tx.websiteTick.deleteMany({
        where: { website_id: id },
      });

      // 2. Delete the website (policy is NOT deleted)
      await tx.website.delete({
        where: { id },
      });
    });

    res.json({ message: "Website and related data deleted successfully", id });
  } catch (error) {
    console.error("Error deleting website:", error);
    res.status(500).json({ message: "Failed to delete website" });
  }
};
