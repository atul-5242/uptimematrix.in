import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if(!header) {
        return res.status(401).json({message: "Unauthorized"});
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token as string,process.env.JWT_SECRET!);
        req.userId=decoded.sub as string;
        next();
    }catch (error) {
        return res.status(401).json({message: "Unauthorized"});
    }
}