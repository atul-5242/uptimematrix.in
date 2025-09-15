import { sendEmail } from "../utils/email.js";
import {prismaClient} from "@uptimematrix/store";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

interface UserPayload {
  id: string;
  organizationId?: string;
  email?: string; // Add email to UserPayload
}

interface CustomRequest extends Request {
  user?: UserPayload;
}

const createInvitationLink = (token: string) => {
  // In a real application, this would be a dynamic link to your frontend's invitation acceptance page
  // For now, we'll use a placeholder. The actual frontend will construct this.
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    console.error("[API] FRONTEND_URL environment variable is not set.");
    return null; // Return null if FRONTEND_URL is not set
  }
  return `${frontendUrl}/accept-invitation?token=${token}`;
};

export const sendInvitations = async (req: CustomRequest, res: Response) => {
  try {
    const { invitationEmails } = req.body;
    const organizationId = req.user?.organizationId; 
    const invitedById = req.user?.id;

    if (!organizationId || !invitedById) {
      return res.status(401).json({ message: "Unauthorized: Organization ID or User ID not found." });
    }

    if (!invitationEmails || !Array.isArray(invitationEmails) || invitationEmails.length === 0) {
      return res.status(400).json({ message: "No invitation emails provided." });
    }

    const organization = await prismaClient.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    // Find or create 'Member' role
    let memberRole = await prismaClient.role.findUnique({ where: { name: "Member" } });
    if (!memberRole) {
      memberRole = await prismaClient.role.create({ data: { name: "Member", description: "Standard member role" } });
    }

    const sentInvitations = [];

    for (const invitedEmail of invitationEmails) {
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(invitedEmail)) {
        console.warn(`[API] Skipping invalid email: ${invitedEmail}`);
        continue;
      }

      // Check if an invitation already exists or user is already a member
      const existingMember = await prismaClient.organizationMember.findUnique({
        where: { 
          email_organizationId: { 
            email: invitedEmail,
            organizationId: organizationId
          }
        }
      });

      if (existingMember) {
        console.log(`[API] Invitation already exists or user is already a member for ${invitedEmail} in organization ${organization.name}`);
        // Optionally, resend invitation or update existing one
        sentInvitations.push({
          email: invitedEmail,
          status: 'exists', // Custom status for frontend feedback
          message: 'Invitation already sent or user is a member.',
        });
        continue;
      }

      // Generate invitation token (e.g., JWT) - No expiration until accepted
      const invitationToken = jwt.sign(
        { email: invitedEmail, organizationId: organization.id, role: 'Member' },
        (process.env.INVITATION_SECRET || "").trim()
      );
      
      const invitationLink = createInvitationLink(invitationToken);
      if (!invitationLink) {
        console.error(`[API] Failed to create invitation link for ${invitedEmail}. Skipping email.`);
        continue;
      }

      // Save invitation to database
      const newInvitationData = {
        email: invitedEmail,
        organizationId: organization.id,
        roleId: memberRole.id, // Use the retrieved/created role ID
        isVerified: false,
        invitedById: invitedById,
        invitationLink: invitationLink,
        name: invitedEmail.split('@')[0], // Use email prefix as default name for now
      };
      console.log("[API] Data sent to Prisma for new invitation:", newInvitationData);
      
      const newInvitation = await prismaClient.organizationMember.create({
        data: newInvitationData,
        select: {
          id: true,
          email: true,
          isVerified: true,
          invitedById: true,
          createdAt: true,
          invitationLink: true,
        },
      });
      console.log("[API] New invitation created in DB:", newInvitation);

      // Send email (similar to signup process)
      const emailSubject = `You're invited to join ${organization.name} on UptimeMatrix.`;
      const emailBody = `
        <p>Hello,</p>
        <p>You've been invited to join the organization <strong>${organization.name}</strong> on UptimeMatrix.</p>
        <p>Click the link below to accept the invitation and set up your account:</p>
        <p><a href="${invitationLink}">${invitationLink}</a></p>
        <p>If you already have a UptimeMatrix. account, please sign in first, then click the link.</p>
        <p>Best regards,</p>
        <p>The UptimeMatrix. Team</p>
      `;
      await sendEmail(invitedEmail, emailSubject, emailBody);
      console.log(`[API] Sent invitation email to ${invitedEmail}`);
      sentInvitations.push({
        id: newInvitation.id,
        email: newInvitation.email,
        status: 'pending',
        invitedBy: newInvitation.invitedById,
        invitedAt: newInvitation.createdAt,
        invitationLink: newInvitation.invitationLink,
      });
    }

    return res.status(200).json({
      message: "Invitations sent successfully.",
      sentInvitations: sentInvitations,
    });
  } catch (error: unknown) {
    console.error("[API] Error sending invitations:", error);
    return res.status(500).json({ message: "Failed to send invitations.", error: (error as Error).message });
  }
};

export const getPendingInvitations = async (req: CustomRequest, res: Response) => {
  console.log("Fetching pending invitations...>>>>>>>>>>>>>");
  try {
    const userEmail = req.user?.email; // Get the logged-in user's email

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: User email not found." });
    }

    const pendingInvitations = await prismaClient.organizationMember.findMany({
      where: {
        email: userEmail, // Filter by the logged-in user's email
        isVerified: false,
        userId: null, // Only fetch invitations that haven't been accepted by a user yet
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        invitationLink: true,
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        invitedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const formattedInvitations = pendingInvitations.map(invite => ({
      id: invite.id,
      email: invite.email,
      status: 'pending',
      invitedBy: invite.invitedBy?.fullName || invite.invitedBy?.email || 'Unknown',
      invitedAt: invite.createdAt,
      invitationLink: invite.invitationLink,
      organizationName: invite.organization.name, // Include organization name
      organizationDescription: invite.organization.description, // Include organization description
      invitedById: invite.invitedBy?.id, // Include invitedBy user's ID
    }));

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(formattedInvitations);
  } catch (error: unknown) {
    console.error("[API] Error fetching pending invitations:", error);
    return res.status(500).json({ message: "Failed to fetch pending invitations.", error: (error as Error).message });
  }
};

export const acceptInvitation = async (req: CustomRequest, res: Response) => {
  try {
    const { invitationLink, name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    if (!invitationLink) {
      return res.status(400).json({ message: "Invitation link not provided." });
    }

    const invitation = await prismaClient.organizationMember.findFirst({
      where: {
        invitationLink: invitationLink,
        isVerified: false,
        userId: null,
      },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation link." });
    }

    // Update the invitation to mark as accepted
    const updatedInvitation = await prismaClient.organizationMember.update({
      where: { id: invitation.id },
      data: {
        userId: userId,
        isVerified: true,
        name: name, // Update the name here
      },
    });

    return res.status(200).json({ message: "Invitation accepted successfully.", organizationId: updatedInvitation.organizationId });
  } catch (error: unknown) {
    console.error("[API] Error accepting invitation:", error);
    return res.status(500).json({ message: "Failed to accept invitation.", error: (error as Error).message });
  }
};