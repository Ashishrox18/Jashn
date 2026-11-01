import { buildFallbackPlan } from '@/lib/fallbackPlan';
import { PlanResponseSchema } from '@/schemas/plan';
import { Brief } from '@/types';

describe('Fallback Plan Generator', () => {
  it('generates a valid wedding plan that strictly conforms to PlanResponseSchema', () => {
    const brief: Brief = {
      eventType: 'wedding',
      title: 'Aarav & Diya Wedding',
      eventDate: '2026-12-15',
      city: 'Jaipur',
      guestCount: 350,
      totalBudgetInr: 2500000,
      vibe: 'Royal heritage, elegant traditional ceremonies',
      constraints: ['vegetarian_only'],
      weddingFunctions: ['sangeet', 'ceremony', 'reception'],
      honoreeAge: null,
      communityKind: null,
    };

    const plan = buildFallbackPlan(brief);
    const parsed = PlanResponseSchema.safeParse(plan);

    expect(parsed.success).toBe(true);
    expect(plan.budget.length).toBeGreaterThanOrEqual(5);
    expect(plan.timeline.length).toBeGreaterThanOrEqual(8);
    expect(plan.vendors.length).toBeGreaterThanOrEqual(3);
    expect(plan.ideas.length).toBeGreaterThanOrEqual(6);
    expect(plan.confidence).toBe(0.95);

    // Assert contingency exists and is >= 5%
    const contingency = plan.budget.find((b) => b.category === 'contingency');
    expect(contingency).toBeDefined();
    expect(contingency!.percent).toBeGreaterThanOrEqual(5);
  });

  it('generates a valid birthday plan that adapts to honoreeAge and passes PlanResponseSchema', () => {
    const kidBrief: Brief = {
      eventType: 'birthday',
      title: 'Kabir 7th Birthday',
      eventDate: '2026-11-25',
      city: 'Bengaluru',
      guestCount: 45,
      totalBudgetInr: 75000,
      vibe: 'Playful, superhero adventure',
      constraints: ['kid_friendly'],
      weddingFunctions: [],
      honoreeAge: 7,
      communityKind: null,
    };

    const plan = buildFallbackPlan(kidBrief);
    const parsed = PlanResponseSchema.safeParse(plan);

    expect(parsed.success).toBe(true);
    expect(plan.summary).toContain('Kabir');
    expect(plan.budget.length).toBeGreaterThanOrEqual(5);
    expect(plan.timeline.length).toBeGreaterThanOrEqual(8);
    expect(plan.vendors.length).toBeGreaterThanOrEqual(3);
    expect(plan.ideas.length).toBeGreaterThanOrEqual(6);
  });

  it('generates a valid community plan with permissions and logistics that passes PlanResponseSchema', () => {
    const communityBrief: Brief = {
      eventType: 'community',
      title: 'Diwali Mela 2026',
      eventDate: '2026-11-10',
      city: 'Pune',
      guestCount: 500,
      totalBudgetInr: 300000,
      vibe: 'Joyful community festival with cultural performances',
      constraints: ['low_waste', 'accessible'],
      weddingFunctions: [],
      honoreeAge: null,
      communityKind: 'festival',
    };

    const plan = buildFallbackPlan(communityBrief);
    const parsed = PlanResponseSchema.safeParse(plan);

    expect(parsed.success).toBe(true);
    expect(plan.budget.some((b) => b.category === 'permissions')).toBe(true);
    expect(plan.timeline.some((t) => t.category === 'permissions')).toBe(true);
  });
});

