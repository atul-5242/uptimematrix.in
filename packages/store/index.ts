
import { PrismaClient } from "@prisma/client";
import { WebsiteStatus } from "@prisma/client";

export const prismaClient = new PrismaClient();
export { WebsiteStatus };