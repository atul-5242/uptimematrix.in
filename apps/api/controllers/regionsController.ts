import { prismaClient } from "@uptimematrix/store";
import type { Request, Response } from "express";

export const getRegions = async (req: Request, res: Response) => {
    try {
        const regions = await prismaClient.region.findMany({
            select: {
                name: true,
                id: true // Assuming you might need ID in the frontend later
            }
        });
        res.status(200).json({ message: "Regions fetched successfully", data: regions });
    } catch (error) {
        console.error("[API] Error fetching regions:", error);
        res.status(500).json({ message: "Failed to fetch regions" });
    }
};
