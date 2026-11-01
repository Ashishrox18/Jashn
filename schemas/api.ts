import { z } from 'zod';
import { BriefSchema } from './brief';

export const PlanRequestSchema = z.object({
  brief: BriefSchema,
  userId: z.string().uuid(),
});

export const IdeasRequestSchema = z.object({
  brief: BriefSchema,
  tweak: z.string().trim().max(200).default(''),
  userId: z.string().uuid(),
});

export const AssistRequestSchema = z.object({
  question: z.string().trim().min(5, 'Question must be at least 5 characters').max(400, 'Question cannot exceed 400 characters'),
  brief: BriefSchema,
  planSummary: z.string().max(1500),
  spentTotalInr: z.number().min(0),
  userId: z.string().uuid(),
});

