import type { Request, Response } from "express";
import { AuthInput } from "../types";
import jwt from "jsonwebtoken";
import { prismaClient } from "store/client";

export const signUp = async(req: Request, res: Response) => {
    const data = AuthInput.safeParse(req.body);
    if(!data.success) {
      console.warn('[API] /auth/user/signup validation failed');
      res.status(403).json({ message: String(data.error) });
      return;
    }
  
    try {
      const existing = await prismaClient.user.findFirst({
        where: { username: data.data.username }
      });
      if (existing) {
        console.warn('[API] /auth/user/signup conflict: user exists');
        return res.status(409).json({ message: "User already exists" });
      }
  
      const user = await prismaClient.user.create({
        data: {
          username: data.data.username,
          password: data.data.password,
        }
      });
  
      console.log('[API] /auth/user/signup success', { id: user.id });
      return res.json({ message: "User created successfully", id: user.id });
    } catch (error) {
      console.error('[API] /auth/user/signup error', error);
      return res.status(500).json({ message: "Internal server error" });
    }
};

export const signIn = async (req: Request, res: Response) => {
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
}