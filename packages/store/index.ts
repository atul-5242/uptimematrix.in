// prismaClient.ts
import { PrismaClient } from "@prisma/client";

// Re-export specific enums from Prisma client to maintain type compatibility
export { Method, MonitorType, Priority, WebsiteStatus, Severity } from "@prisma/client";

// Export Website type from types.ts
export { Website } from "./types.js";

// Prisma client instance (singleton)
export const prismaClient = new PrismaClient();
