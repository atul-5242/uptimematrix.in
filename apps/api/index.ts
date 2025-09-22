import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoute/authroute.js";
import websiteRouter from "./routes/websiteRoute/websiteroute.js";
import escalationRouter from "./routes/escalationRoute/escalationPoliciesRoute.js";
import userDetailsRouter from "./routes/userRoute/userRoutes.js";
import sessionRouter from "./routes/authRoute/session.js";
import organizationRouter from "./routes/organizationRoutes/organizationRoutes.js";
import teamRouter from "./routes/team-sectionRoutes/team/teamRoutes.js";
import roleRouter from "./routes/team-sectionRoutes/roles/roleRoutes.js";
import onCallRoutes from './routes/oncallRoute/oncallRoutes.js';
import regionsRouter from "./routes/regions.js"; // Import the new regions router
import incidentRouter from "./routes/incidentRoutes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true 
}));

app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/website", websiteRouter);
app.use("/escalation-policies", escalationRouter);
app.use("/userprofile", userDetailsRouter);
app.use("/organization", organizationRouter);
app.use("/api/regions", regionsRouter); // Register the new regions router under /api

// Team management routes
app.use("/api/teams", teamRouter);
app.use("/api/roles", roleRouter);
app.use('/api/oncall', onCallRoutes);
app.use("/api/incidents", incidentRouter);
// Session validation endpoint
app.use("/api", sessionRouter);

// Error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Not found handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;