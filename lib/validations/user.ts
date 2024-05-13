import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo: z.string().url().min(1),
    name: z.string().min(3, "Minimum 3 characters required").max(30, "Maximum 30 characters allowed"),
    username: z.string().min(3, "Minimum 3 characters required").max(30, "Maximum 30 characters allowed"),
    bio: z.string().min(10, "Minimum 3 characters required").max(1000, "Maximum 1000 characters allowed"),
});