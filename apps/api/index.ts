import express from "express";
import {prismaClient} from "store/client"
import { AuthInput } from "./types";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

// Minimal request logger for auth routes
app.use((req, _res, next) => {
  if (req.path.startsWith('/user/')) {
    const username = typeof req.body?.username === 'string' ? req.body.username : undefined;
    console.log(`[API] ${req.method} ${req.path}`, username ? { username } : {});
  }
  next();
});

app.post("/website", authMiddleware,async (req, res) => {
  if(!req.body.url) {
    return res.status(411).json({message: "URL is required"});
  }
  const website = await prismaClient.website.create({
    data: {
      url: req.body.url,
      timeAdded: new Date(),
      user_id: req.userId!,
    }
  })

  res.json({ message: "Website added successfully", id: website.id });
});

app.get("/status/:websiteId",authMiddleware , async (req, res) => {
  const website = await prismaClient.website.findFirst({
    where:{ user_id:req.userId!, id:req.params.websiteId },
    include:{ ticks:{ orderBy:[{ createdAt:"desc" }], take:1 } }
  })

  if(!website) {
    res.status(409).json({ message: "Website not found" });
    return;
  }

  res.json({
    message: "Website status fetched successfully",
    url: website.url,
    status: website.ticks[0]?.status,
    id: website.id,
    userId: website.user_id,
  })
});

app.post("/user/signup", async(req, res) => {
  const data = AuthInput.safeParse(req.body);
  if(!data.success) {
    console.warn('[API] /user/signup validation failed');
    res.status(403).json({ message: String(data.error) });
    return;
  }

  try {
    const existing = await prismaClient.user.findFirst({
      where: { username: data.data.username }
    });
    if (existing) {
      console.warn('[API] /user/signup conflict: user exists');
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await prismaClient.user.create({
      data: {
        username: data.data.username,
        password: data.data.password,
      }
    });

    console.log('[API] /user/signup success', { id: user.id });
    return res.json({ message: "User created successfully", id: user.id });
  } catch (error) {
    console.error('[API] /user/signup error', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/user/signin",async (req, res) => {
  const data = AuthInput.safeParse(req.body);
  if(!data.success) {
    console.warn('[API] /user/signin validation failed');
    res.status(403).json({ message: String(data.error) });
    return;
  }
  try {
    const user = await prismaClient.user.findFirst({
      where: {
        username: data.data.username,
        password: data.data.password,
      }
    });

    if(!user) {
      console.warn('[API] /user/signin invalid credentials');
      res.status(403).json({ message: "Invalid username or password" });
      return;
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!);

    console.log('[API] /user/signin success', { id: user.id });
    res.json({ jwt: token, message: "User signed in successfully" });
  } catch (error) {
    console.error('[API] /user/signin error', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
