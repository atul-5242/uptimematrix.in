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
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes
app.options("*", cors(corsOptions));

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
