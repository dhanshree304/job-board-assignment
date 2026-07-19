import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["employer", "jobseeker"]),
  company: z
    .object({
      name: z.string().trim().max(150).optional(),
      website: z.string().trim().max(200).optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  headline: z.string().trim().max(150).optional(),
  location: z.string().trim().max(100).optional(),
  skills: z.array(z.string().trim().max(40)).max(50).optional(),
  company: z
    .object({
      name: z.string().trim().max(150).optional(),
      website: z.string().trim().max(200).optional(),
      about: z.string().trim().max(2000).optional(),
    })
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
