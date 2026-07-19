import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().trim().min(2).max(150),
  companyName: z.string().trim().min(1).max(150),
  location: z.string().trim().min(1).max(100),
  type: z.enum(["full-time", "part-time", "contract", "internship"]),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().trim().max(10).optional(),
  description: z.string().trim().min(20).max(10000),
  requirements: z.array(z.string().trim().max(300)).max(50).optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(["open", "closed"]).optional(),
});

export const listJobsQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  location: z.string().trim().max(100).optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship"]).optional(),
  workMode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  tag: z.string().trim().max(40).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const applySchema = z.object({
  coverNote: z.string().trim().max(3000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["applied", "reviewed", "shortlisted", "rejected", "hired"]),
});
