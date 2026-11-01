import { z } from 'zod';
import { Category, BriefSchema } from './brief';
import { PlanResponseSchema } from './plan';

export const VendorStatus = z.enum(['to_contact', 'contacted', 'quoted', 'booked', 'dropped']);

export const EventStateSchema = z.object({
  spentByCategory: z.record(Category, z.number().min(0).max(1_000_000_000)).default({}),
  completedTaskIds: z.array(z.string()).max(200).default([]),
  vendorStatus: z.record(Category, VendorStatus).default({}),
});

export const EventRecordSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  source: z.enum(['ai', 'fallback']),
  brief: BriefSchema,
  plan: PlanResponseSchema,
  state: EventStateSchema,
});

export const StoreSchema = z.object({
  version: z.literal('1'),
  userId: z.string().uuid(),
  events: z.array(EventRecordSchema).max(10),
});
