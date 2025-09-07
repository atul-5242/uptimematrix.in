import type { Request, Response } from "express";
import { AuthInput } from "../types.js";
import jwt from "jsonwebtoken";
import { prismaClient } from "@uptimematrix/store";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

// ---------------------- PASSWORD HELPERS ----------------------
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hashed = scryptSync(password, salt, 64);
  return salt.toString("hex") + ":" + hashed.toString("hex"); // store salt + hash
}

function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  const salt = Buffer.from(saltHex!, "hex");
  const hash = scryptSync(password, salt, 64);
  return timingSafeEqual(hash, Buffer.from(hashHex!, "hex"));
}

// ---------------------- CONFIG ----------------------
const JWT_EXPIRES_IN = "7d";

// ---------------------- SIGN UP ----------------------
export const signUp = async (req: Request, res: Response) => {
  const data = AuthInput.safeParse(req.body);
  if (!data.success) {
    const errorMessage =
      Array.isArray(data.error.issues) && data.error.issues[0]?.message
        ? data.error.issues[0].message
        : "Invalid input";
    console.warn("[API] /auth/user/signup validation failed", errorMessage);
    return res.status(400).json({ message: errorMessage });
  }

  try {
    const existing = await prismaClient.user.findFirst({
      where: { email: data.data.email },
    });

    if (existing) {
      console.warn("[API] /auth/user/signup conflict: email already exists");
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = hashPassword(data.data.password);

    const user = await prismaClient.user.create({
      data: {
        email: data.data.email,
        password: hashedPassword,
        fullName: data.data.fullName,
      },
    });

    console.log("[API] /auth/user/signup success", { id: user.id });
    return res.json({
      message: "User created successfully",
      id: user.id,
    });
  } catch (error) {
    console.error("[API] /auth/user/signup error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------- SIGN IN ----------------------
export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("[API] /auth/user/signin missing credentials");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      console.warn("[API] /auth/user/signin invalid credentials (email)");
      return res.status(403).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.warn("[API] /auth/user/signin invalid credentials (password)");
      return res.status(403).json({ message: "Invalid email or password" });
    }

    console.log("JWT_SECRET loaded:", (process.env.JWT_SECRET || "").trim());
    

    // Create JWT with expiry
    const token = jwt.sign({ sub: user.id }, (process.env.JWT_SECRET || "").trim(), {
      expiresIn: JWT_EXPIRES_IN,
    });
    console.log("token created:", token);

    console.log("[API] /auth/user/signin success", { id: user.id });
    return res.json({
      jwt: token,
      message: "User signed in successfully",
    });
  } catch (error) {
    console.error("[API] /auth/user/signin error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
