"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = exports.IncidentSeverity = exports.IncidentStatus = exports.Severity = exports.WebsiteStatus = exports.Priority = exports.MonitorType = exports.Method = exports.Prisma = void 0;
// prismaClient.ts
var client_1 = require("@prisma/client");
// Re-export specific enums from Prisma client to maintain type compatibility
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_2.Prisma; } });
Object.defineProperty(exports, "Method", { enumerable: true, get: function () { return client_2.Method; } });
Object.defineProperty(exports, "MonitorType", { enumerable: true, get: function () { return client_2.MonitorType; } });
Object.defineProperty(exports, "Priority", { enumerable: true, get: function () { return client_2.Priority; } });
Object.defineProperty(exports, "WebsiteStatus", { enumerable: true, get: function () { return client_2.WebsiteStatus; } });
Object.defineProperty(exports, "Severity", { enumerable: true, get: function () { return client_2.Severity; } });
Object.defineProperty(exports, "IncidentStatus", { enumerable: true, get: function () { return client_2.IncidentStatus; } });
Object.defineProperty(exports, "IncidentSeverity", { enumerable: true, get: function () { return client_2.IncidentSeverity; } });
// Prisma client instance (singleton)
exports.prismaClient = new client_1.PrismaClient();
