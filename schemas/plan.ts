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

export const IdeaSchema = z.preprocess((val: unknown) => {
  if (typeof val === 'object' && val !== null) {
    const raw = val as Record<string, unknown>;
    let t = String(raw['type'] || 'activity').toLowerCase().trim();
    if (t.includes('food') || t.includes('cater') || t.includes('drink') || t.includes('dish')) t = 'menu';
    else if (t.includes('music') || t.includes('dj') || t.includes('dance') || t.includes('sing') || t.includes('performance')) t = 'entertainment';
    else if (t.includes('favor') || t.includes('gift') || t.includes('hamper') || t.includes('souvenir')) t = 'gift';
    else if (t.includes('decor') || t.includes('flower') || t.includes('light') || t.includes('mandap') || t.includes('stage')) t = 'decor';
    else if (t.includes('theme') || t.includes('concept') || t.includes('vibe')) t = 'theme';
    else if (!['theme', 'menu', 'activity', 'decor', 'gift', 'entertainment'].includes(t)) {
      t = 'activity';
    }

    const titleStr = typeof raw['title'] === 'string' ? raw['title'].trim() : 'Celebration Idea';
    const descStr = typeof raw['description'] === 'string' ? raw['description'].trim() : '';
    const cost = typeof raw['estCostInr'] === 'number' && !isNaN(raw['estCostInr'])
      ? Math.max(0, Math.round(raw['estCostInr']))
      : null;

    return {
      type: t,
      title: titleStr.slice(0, 150),
      description: descStr.slice(0, 1000),
      estCostInr: cost,
    };
  }
  return val;
}, z.object({
  type: IdeaType,
  title: z.string().min(1).max(150),
  description: z.string().max(1000),
  estCostInr: z.number().int().min(0).nullable(),
}));

export const RiskSchema = z.object({
  risk: z.string().max(200),
  mitigation: z.string().max(300),
});

export const PlanResponseSchema = z.object({
  summary: z.string().max(1000),
  budget: z.array(BudgetLineSchema).min(4).max(16),
  timeline: z.array(TaskSchema).min(6).max(35),
  vendors: z.array(VendorSchema).min(2).max(16),
  ideas: z.array(IdeaSchema).min(4).max(20),
  risks: z.array(RiskSchema).max(8),
  confidence: z.number().min(0).max(1),
});

export const IdeasResponseSchema = z.preprocess((val: unknown) => {
  if (typeof val === 'object' && val !== null) {
    const raw = val as Record<string, unknown>;
    const ideasList = raw['ideas'] || raw['suggestions'] || [];
    const noteStr = typeof raw['note'] === 'string'
      ? raw['note']
      : typeof raw['summary'] === 'string'
      ? raw['summary']
      : 'Updated suggestions tailored to your celebration';
    return {
      ideas: Array.isArray(ideasList) ? ideasList : [],
      note: noteStr.slice(0, 1000),
    };
  }
  return val;
}, z.object({
  ideas: z.array(IdeaSchema).min(1).max(20),
  note: z.string().max(1000),
}));

export const AssistResponseSchema = z.preprocess((val: unknown) => {
  if (typeof val === 'object' && val !== null) {
    const raw = val as Record<string, unknown>;
    const answerStr = typeof raw['answer'] === 'string'
      ? raw['answer']
      : typeof raw['guidance'] === 'string'
      ? raw['guidance']
      : typeof raw['response'] === 'string'
      ? raw['response']
      : '';
    const followUpsList = Array.isArray(raw['followUps'])
      ? raw['followUps']
      : Array.isArray(raw['follow_ups'])
      ? raw['follow_ups']
      : [];
    const caveatStr = typeof raw['caveat'] === 'string'
      ? raw['caveat']
      : typeof raw['disclaimer'] === 'string'
      ? raw['disclaimer']
      : null;

    return {
      answer: answerStr.slice(0, 4000),
      followUps: followUpsList.map((f) => String(f).slice(0, 300)),
      caveat: caveatStr ? caveatStr.slice(0, 1000) : null,
    };
  }
  return val;
}, z.object({
  answer: z.string().min(1).max(4000),
  followUps: z.array(z.string().max(300)).default([]),
  caveat: z.string().max(1000).nullable().optional(),
}));

