import { prismaClient } from "store/client"
import type { Request, Response } from "express";

export const addWebsite = async (req: Request, res: Response) => {
    if (!req.body.url) {
        return res.status(411).json({ message: "URL is required" });
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
        include: { ticks: { orderBy: [{ createdAt: "desc" }], take: 1 } }
    })

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
    })
};