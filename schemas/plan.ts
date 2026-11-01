import { z } from 'zod';
import { Category } from './brief';

export const BudgetLineSchema = z.object({
  category: Category,
  percent: z.number().min(0).max(100),
  rationale: z.string().max(200),
  tips: z.array(z.string().max(140)).max(3),
});

export const TaskSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().max(80),
  details: z.string().max(200),
  category: Category,
  priority: z.enum(['high', 'medium', 'low']),
  weeksBefore: z.number().int().min(0).max(78),
});

export const VendorSchema = z
  .object({
    category: Category,
    whatToBook: z.string().max(120),
    questionsToAsk: z.array(z.string().max(140)).min(3).max(5),
    typicalCostMinInr: z.number().int().min(0),
    typicalCostMaxInr: z.number().int().min(0),
    bookWeeksBefore: z.number().int().min(0).max(78),
    redFlags: z.array(z.string().max(140)).max(3),
  })
  .refine((v) => v.typicalCostMaxInr >= v.typicalCostMinInr, {
    message: 'max must be >= min',
  });

export const IdeaType = z.enum(['theme', 'menu', 'activity', 'decor', 'gift', 'entertainment']);

export const IdeaSchema = z.object({
  type: IdeaType,
  title: z.string().max(60),
  description: z.string().max(250),
  estCostInr: z.number().int().min(0).nullable(),
});

export const RiskSchema = z.object({
  risk: z.string().max(140),
  mitigation: z.string().max(200),
});

export const PlanResponseSchema = z.object({
  summary: z.string().max(400),
  budget: z.array(BudgetLineSchema).min(5).max(12),
  timeline: z.array(TaskSchema).min(8).max(30),
  vendors: z.array(VendorSchema).min(3).max(12),
  ideas: z.array(IdeaSchema).min(6).max(16),
  risks: z.array(RiskSchema).max(5),
  confidence: z.number().min(0).max(1),
});

export const IdeasResponseSchema = z.object({
  ideas: z.array(IdeaSchema).min(4).max(10),
  note: z.string().max(200),
});

export const AssistResponseSchema = z.object({
  answer: z.string().max(700),
  followUps: z.array(z.string().max(120)).max(3),
  caveat: z.string().max(200).nullable(),
});
