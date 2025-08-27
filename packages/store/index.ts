// prismaClient.ts
import { PrismaClient } from "@prisma/client";

// Enums from Prisma schema
import {
  Priority,
  WebsiteStatus,
  MonitorType,
  Method,
  Severity,
} from "@prisma/client";

// Prisma client instance (singleton)
export const prismaClient = new PrismaClient();

// Re-export enums for use throughout the app
export {
  Priority,
  WebsiteStatus,
  MonitorType,
  Method,
  Severity,
};
