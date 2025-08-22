import { prismaClient } from "@uptimematrix/store"
import type { Request, Response } from "express";

export const addWebsite = async (req: Request, res: Response) => {
    if (!req.body.url) {
        return res.status(411).json({ message: "URL is required" });
    }

    try {
        new URL(req.body.url);
    } catch (error) {
        return res.status(400).json({ message: "Invalid URL provided" });
    }

    const website = await prismaClient.website.create({
        data: {
            url: req.body.url,
            timeAdded: new Date(),
            user_id: req.userId!,
        }
    })
    res.json({ message: "Website added successfully", id: website.id });
};

export const getWebsiteStatus = async (req: Request, res: Response) => {
    const website = await prismaClient.website.findFirst({
      where: { user_id: req.userId!, id: req.params.websiteId },
      include: { ticks: { orderBy: [{ createdAt: "desc" }], take: 20 } }, // fetch more ticks
      orderBy: { timeAdded: "desc" },
    }
  );
  
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
      ticks: website.ticks.map((t:any) => ({
        response_time_ms: t.response_time_ms,
        createdAt: t.createdAt,
        status: t.status,
      })),
    });
  };
  


export const getAllWebsites = async (req: Request, res: Response) => {
  try {
    const websites = await prismaClient.website.findMany({
      where: { user_id: req.userId! },
      include: {
        ticks: {
          orderBy: { createdAt: "desc" },
          take: 1, // get the latest tick (current status)
        },
      },
      orderBy: { timeAdded: "desc" },
    });

    res.json({
      message: "All Websites fetched successfully",
      websites: websites.map((w:any) => ({
        id: w.id,
        url: w.url,
        timeAdded: w.timeAdded,
        status: w.ticks[0]?.status ?? "unknown",
        lastCheckedAt: w.ticks[0]?.createdAt ?? null,
        userId: w.user_id,
      })),
    });
  } catch (error) {
    console.error("Error fetching websites:", error);
    res.status(500).json({ message: "Failed to fetch websites" });
  }
};