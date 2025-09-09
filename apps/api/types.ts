import {z} from "zod";

export const AuthInput = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    organizationName: z.string().min(1, 'Organization name is required'),
    invitationEmails: z.array(z.string().email('Invalid invitation email')).optional(),
});