import express from "express";
import cors from 'cors';
import authRouter from "./routes/authRoute/authroute";
import websiteRouter from "./routes/websiteRoute/websiteroute";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));


app.use(express.json());
app.use("/auth", authRouter);
app.use("/website", websiteRouter);


// Minimal request logger for auth routes
// app.use((req, _res, next) => {
//   if (req.path.startsWith('/user/')) {
//     const username = typeof req.body?.username === 'string' ? req.body.username : undefined;
//     console.log(`[API] ${req.method} ${req.path}`, username ? { username } : {});
//   }
//   next();
// });


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
