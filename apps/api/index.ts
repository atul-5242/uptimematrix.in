import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/authRoute/authroute.js";
import websiteRouter from "./routes/websiteRoute/websiteroute.js";
import escalationRouter from "./routes/escalationRoute/escalationPoliciesRoute.js";
import userDetailsRouter from "./routes/userRoute/userRoutes.js";
import sessionRouter from "./routes/authRoute/session.js";
import organizationRouter from "./routes/organizationRoutes/organizationRoutes.js";
import teamRouter from "./routes/team-sectionRoutes/team/teamRoutes.js";
import roleRouter from "./routes/team-sectionRoutes/roles/roleRoutes.js";
import onCallRoutes from './routes/oncallRoute/oncallRoutes.js';
import regionsRouter from "./routes/regions.js";
import incidentRouter from "./routes/incidentRoutes.js";
import incidentAnalyticsRouter from "./routes/incidentAnalyticsRoutes.js";

dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ["https://uptimematrix.atulmaurya.in"];

const corsOptions = {
  origin: function(origin: string | undefined, callback: any) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware before routes
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Handle preflight for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());

// Health check endpoints
app.get("/", (req, res) => res.json({ status: "OK", message: "UptimeMatrix API is running" }));
app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

// Routes
app.use("/auth", authRouter);
app.use("/website", websiteRouter);
app.use("/escalation-policies", escalationRouter);
app.use("/userprofile", userDetailsRouter);
app.use("/organization", organizationRouter);
app.use("/api/regions", regionsRouter);

app.use("/api/teams", teamRouter);
app.use("/api/roles", roleRouter);
app.use("/api/oncall", onCallRoutes);
app.use("/api/incidents", incidentRouter);
app.use("/api/incidents/analytics", incidentAnalyticsRouter);
app.use("/api", sessionRouter);

// Error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("API Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 Not found
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
