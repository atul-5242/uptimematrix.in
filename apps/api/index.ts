import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoute/authroute.js";
import websiteRouter from "./routes/websiteRoute/websiteroute.js";
import escalationRouter from "./routes/escalationRoute/escalationPoliciesRoute.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));


app.use(express.json());
app.use("/auth", authRouter);
app.use("/website", websiteRouter);

app.use("/escalation-policies", escalationRouter);


// Minimal request logger for auth routes
// app.use((req, _res, next) => {
//   if (req.path.startsWith('/user/')) {
//     const username = typeof req.body?.username === 'string' ? req.body.username : undefined;
//     console.log(`[API] ${req.method} ${req.path}`, username ? { username } : {});
//   }
//   next();
// });


app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});
