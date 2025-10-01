import {z} from "zod";

export const AuthInput = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    organizationName: z.string().min(1, 'Organization name is required'),
    invitationEmails: z.array(z.string().email('Invalid invitation email')).optional(),
});
// Organization input validation
export const CreateOrganizationInput = z.object({
    name: z.string().min(1, "Organization name is required"),
    description: z.string().optional()
});

export const UpdateOrganizationInput = z.object({
    id: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Organization name is required"),
    description: z.string().optional()
});

export const SendInvitationInput = z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    email: z.string().email("Invalid email address"),
    role: z.string().optional()
});

export const RemoveMemberInput = z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    memberId: z.string().min(1, "Member ID is required")
});

// Export types
export type AuthInputType = z.infer<typeof AuthInput>;
export type CreateOrganizationInputType = z.infer<typeof CreateOrganizationInput>;
export type UpdateOrganizationInputType = z.infer<typeof UpdateOrganizationInput>;
export type SendInvitationInputType = z.infer<typeof SendInvitationInput>;
export type RemoveMemberInputType = z.infer<typeof RemoveMemberInput>;
