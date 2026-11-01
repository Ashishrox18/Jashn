import { z } from 'zod';

export const EventType = z.enum(['wedding', 'birthday', 'community']);

export const Constraint = z.enum([
  'vegetarian_only',
  'jain_friendly',
  'kid_friendly',
  'outdoor',
  'indoor',
  'accessible',
  'alcohol_free',
  'low_waste',
]);

export const WeddingFunction = z.enum([
  'engagement',
  'haldi',
  'mehendi',
  'sangeet',
  'ceremony',
  'reception',
]);

export const Category = z.enum([
  'venue',
  'catering',
  'decor',
  'photography',
  'entertainment',
  'attire',
  'invitations',
  'transport',
  'accommodation',
  'gifts',
  'logistics',
  'permissions',
  'contingency',
  'other',
]);

export const CommunityKind = z.enum([
  'festival',
  'fundraiser',
  'sports',
  'cultural',
  'society_meet',
  'other',
]);

export const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const isoDate = z.string().regex(isoDateRegex, { message: 'Must be in YYYY-MM-DD format' });

export function validateEventDateBounds(eventDate: string, todayStr?: string): { valid: boolean; error?: string } {
  if (!isoDateRegex.test(eventDate)) {
    return { valid: false, error: 'Event date must be in YYYY-MM-DD format' };
  }
  const today = todayStr ?? new Date().toISOString().slice(0, 10);
  if (eventDate < today) {
    return { valid: false, error: 'Event date cannot be in the past' };
  }
  // 5 years ahead
  const [tYear, tMonth, tDay] = today.split('-').map(Number);
  if (tYear === undefined || tMonth === undefined || tDay === undefined) {
    return { valid: false, error: 'Invalid reference date' };
  }
  const maxYear = tYear + 5;
  const maxDate = `${maxYear}-${String(tMonth).padStart(2, '0')}-${String(tDay).padStart(2, '0')}`;
  if (eventDate > maxDate) {
    return { valid: false, error: 'Event date cannot be more than 5 years in the future' };
  }
  return { valid: true };
}

export const BriefBaseSchema = z.object({
  eventType: EventType,
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(80, 'Title cannot exceed 80 characters'),
  eventDate: isoDate,
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(60, 'City cannot exceed 60 characters'),
  guestCount: z.number().int().min(2, 'Guest count must be at least 2').max(5000, 'Guest count cannot exceed 5000'),
  totalBudgetInr: z.number().int().min(5000, 'Budget must be at least ₹5,000').max(100_000_000, 'Budget cannot exceed ₹10,00,00,000'),
  vibe: z.string().trim().max(500, 'Vibe notes cannot exceed 500 characters').default(''),
  constraints: z.array(Constraint).max(8).default([]),
  weddingFunctions: z.array(WeddingFunction).max(6).default([]),
  honoreeAge: z.number().int().min(0, 'Age cannot be negative').max(110, 'Age must be 110 or less').nullable().default(null),
  communityKind: CommunityKind.nullable().default(null),
});

export const BriefSchema = BriefBaseSchema.superRefine((data, ctx) => {
  const check = validateEventDateBounds(data.eventDate);
  if (!check.valid && check.error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: check.error,
      path: ['eventDate'],
    });
  }
  if (data.eventType === 'wedding' && data.weddingFunctions.length === 0) {
    // optional or default, but if specified
  }
  if (data.eventType === 'birthday' && data.honoreeAge === null) {
    // keep flexible or default
  }
});

