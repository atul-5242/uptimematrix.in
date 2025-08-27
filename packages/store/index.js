"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Severity = exports.Method = exports.MonitorType = exports.WebsiteStatus = exports.Priority = exports.prismaClient = void 0;
// prismaClient.ts
var client_1 = require("@prisma/client");
// Enums from Prisma schema
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "Priority", { enumerable: true, get: function () { return client_2.Priority; } });
Object.defineProperty(exports, "WebsiteStatus", { enumerable: true, get: function () { return client_2.WebsiteStatus; } });
Object.defineProperty(exports, "MonitorType", { enumerable: true, get: function () { return client_2.MonitorType; } });
Object.defineProperty(exports, "Method", { enumerable: true, get: function () { return client_2.Method; } });
Object.defineProperty(exports, "Severity", { enumerable: true, get: function () { return client_2.Severity; } });
// Prisma client instance (singleton)
exports.prismaClient = new client_1.PrismaClient();
