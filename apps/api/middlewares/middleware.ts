import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import { prismaClient } from "@uptimematrix/store";
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    // console.log("header ---------",header);
    if(!header) {
        return res.status(401).json({message: "Unauthorized"});
    }
    const token = header.split(" ")[1];
    try {
        console.log("token ---------",token);
        const decoded = jwt.verify(token as string,process.env.JWT_SECRET!);
        console.log("decoded ---------",decoded);
        req.userId=decoded.sub as string;
        (async () => {
            const orgMember = await prismaClient.organizationMember.findFirst({
                where: { userId: req.userId! },
                select: { organizationId: true },
            });
            if (orgMember) {
                req.organizationId = orgMember.organizationId;
            }
            next();
        })();
    }catch (error) {
        return res.status(401).json({message: "Unauthorized okay",
            error: error
        });
    }
}