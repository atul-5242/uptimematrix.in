import type { Request, Response } from "express";
import { AuthInput } from "../types.js";
import jwt from "jsonwebtoken"; 
import { prismaClient } from "@uptimematrix/store"; 


export const signUp = async(req: Request, res: Response) => {
    const data = AuthInput.safeParse(req.body);
    if(!data.success) {
      const errorMessage = Array.isArray(data.error.issues) && data.error.issues[0]?.message 
        ? data.error.issues[0].message 
        : 'Invalid input';
      console.warn('[API] /auth/user/signup validation failed', errorMessage);
      res.status(400).json({ message: errorMessage });
      return;
    }
  
    try {
      const existing = await prismaClient.user.findFirst({
        where: { email: data.data.email }
      });
      if (existing) {
        console.warn('[API] /auth/user/signup conflict: email already exists');
        return res.status(409).json({ message: "Email already registered" });
      }
  
      // Generate a username from the email (first part before @)
      const username = data.data.email.split('@')[0] || 'user' + Date.now();
      
      const user = await prismaClient.user.create({
        data: {
          email: data.data.email,
          password: data.data.password,
          // Generate a simple username from email (first part before @)
          username: data.data.email.split('@')[0] || 'user' + Date.now()
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
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.warn('[API] /user/signin missing credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
      const user = await prismaClient.user.findFirst({
        where: {
          email: email,
          password: password
        }
      });

      if(!user) {
        console.warn('[API] /user/signin invalid credentials');
        res.status(403).json({ message: "Invalid email or password" });
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