import type { Request, Response } from "express";
import { AuthInput } from "../types.js";
import jwt from "jsonwebtoken";
import { prismaClient } from "@uptimematrix/store";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { sendEmail, createInvitationLink } from "../utils/email.js"; // Import new email utility

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
    
    const { email, password, fullName, organizationName, invitationEmails } = data.data;
    
    // Create Organization
    const organization = await prismaClient.organization.create({
      data: {
        name: organizationName,
        description: `Organization for ${organizationName}`,
      },
    });
    
    // Create User
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });
    
    // Find or create 'Admin' role
    let adminRole = await prismaClient.role.findUnique({ where: { name: "Admin" } });
    if (!adminRole) {
      adminRole = await prismaClient.role.create({ data: { name: "Admin", description: "Administrator role" } });
    }
    
    // Create OrganizationMember for the user who signed up
    await prismaClient.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        roleId: adminRole.id,
        email: user.email,
        name: user.fullName || "",
        isVerified: true, // The user who signed up is verified
      },
    });
    
    // Handle invitation emails
    if (invitationEmails && invitationEmails.length > 0) {
      // Find or create 'Member' role
      let memberRole = await prismaClient.role.findUnique({ where: { name: "Member" } });
      if (!memberRole) {
        memberRole = await prismaClient.role.create({ data: { name: "Member", description: "Standard member role" } });
      }
      
      for (const invitedEmail of invitationEmails) {
        // Create inactive OrganizationMember for the invited user (no User record yet)
        await prismaClient.organizationMember.create({
          data: {
            organizationId: organization.id,
            roleId: memberRole.id,
            email: invitedEmail,
            name: invitedEmail.split('@')[0] || invitedEmail, // Basic name from email
            isVerified: false, // Will be true when they accept invitation
            invitedById: user.id, // The user who created the organization invited them
            userId: null, // No userId - will be set when they accept invitation and create/link account
          },
        });
        
        // Generate invitation token (e.g., JWT) - No expiration until accepted
        const invitationToken = jwt.sign(
          { email: invitedEmail, organizationId: organization.id, role: 'Member' },
          (process.env.INVITATION_SECRET || "").trim() // Use a separate secret for invitations
          // No expiration - token is valid until accepted
        );
        
        const invitationLink = createInvitationLink(invitationToken);
        const emailSubject = `You're invited to join ${organization.name} on UptimeMatrix.`;
        const emailBody = `
          <p>Hello,</p>
          <p>You've been invited by ${user.fullName || user.email} to join the organization <strong>${organization.name}</strong> on UptimeMatrix..</p>
          <p>Click the link below to accept the invitation and set up your account:</p>
          <p><a href="${invitationLink}">${invitationLink}</a></p>
          <p>If you already have a UptimeMatrix. account, please sign in first, then click the link.</p>
          <p>Best regards,</p>
          <p>The UptimeMatrix. Team</p>
        `;
        
        await sendEmail(invitedEmail, emailSubject, emailBody);
        console.log(`[API] Sent invitation email to ${invitedEmail}`);
      }
    }

    console.log("[API] /auth/user/signup success", { id: user.id });
    return res.json({
      message: "User created successfully",
      id: user.id,
      organizationId: organization.id,
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
