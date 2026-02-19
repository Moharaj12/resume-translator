import { z } from "zod";

export const ResumeSchema = z.object({
  header: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    location: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    links: z.array(z.string()).optional(),
  }),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(
    z.object({
      company: z.string().optional(),
      role: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      bullets: z.array(z.string()).default([]),
    }),
  ),
  education: z.array(
    z.object({
      school: z.string().optional(),
      program: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      bullets: z.array(z.string()).optional(),
    }),
  ),
  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .optional(),
});

export type ResumeJSON = z.infer<typeof ResumeSchema>;
