import { BriefBaseSchema, validateEventDateBounds } from '@/schemas/brief';
import { PlanResponseSchema, VendorSchema } from '@/schemas/plan';
import { buildFallbackPlan } from '@/lib/fallbackPlan';
import { Brief } from '@/types';

describe('Zod Schemas', () => {
  describe('BriefSchema & Date Bounds', () => {
    it('rejects past dates and dates beyond 5 years', () => {
      const today = '2026-11-01';
      expect(validateEventDateBounds('2026-10-31', today).valid).toBe(false);
      expect(validateEventDateBounds('2026-10-31', today).error).toContain('past');

      expect(validateEventDateBounds('2032-01-01', today).valid).toBe(false);
      expect(validateEventDateBounds('2032-01-01', today).error).toContain('5 years');

      expect(validateEventDateBounds('2027-05-10', today).valid).toBe(true);
    });

    it('rejects guest counts below 2 or above 5000', () => {
      const base = {
        eventType: 'wedding',
        title: 'Valid Title',
        eventDate: '2027-01-01',
        city: 'Delhi',
        totalBudgetInr: 100000,
      };

      expect(BriefBaseSchema.safeParse({ ...base, guestCount: 0 }).success).toBe(false);
      expect(BriefBaseSchema.safeParse({ ...base, guestCount: 1 }).success).toBe(false);
      expect(BriefBaseSchema.safeParse({ ...base, guestCount: 5001 }).success).toBe(false);
      expect(BriefBaseSchema.safeParse({ ...base, guestCount: 100 }).success).toBe(true);
    });

    it('rejects budget below ₹5,000 or above ₹10,00,00,000', () => {
      const base = {
        eventType: 'birthday',
        title: 'Valid Title',
        eventDate: '2027-01-01',
        city: 'Mumbai',
        guestCount: 20,
      };

      expect(BriefBaseSchema.safeParse({ ...base, totalBudgetInr: 4999 }).success).toBe(false);
      expect(BriefBaseSchema.safeParse({ ...base, totalBudgetInr: 100_000_001 }).success).toBe(false);
      expect(BriefBaseSchema.safeParse({ ...base, totalBudgetInr: 50000 }).success).toBe(true);
    });
  });

  describe('VendorSchema', () => {
    it('rejects vendor where max cost is less than min cost', () => {
      const invalid = {
        category: 'venue',
        whatToBook: 'Banquet Hall',
        questionsToAsk: ['Q1?', 'Q2?', 'Q3?'],
        typicalCostMinInr: 50000,
        typicalCostMaxInr: 40000, // less than min!
        bookWeeksBefore: 12,
        redFlags: ['Flag 1'],
      };

      const result = VendorSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('accepts vendor where max cost >= min cost', () => {
      const valid = {
        category: 'venue',
        whatToBook: 'Banquet Hall',
        questionsToAsk: ['Q1?', 'Q2?', 'Q3?'],
        typicalCostMinInr: 50000,
        typicalCostMaxInr: 80000,
        bookWeeksBefore: 12,
        redFlags: ['Flag 1'],
      };

      const result = VendorSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('PlanResponseSchema', () => {
    it('rejects budget array with fewer than 5 items', () => {
      const invalidPlan = {
        summary: 'Short summary',
        budget: [
          { category: 'venue', percent: 50, rationale: '', tips: [] },
          { category: 'catering', percent: 40, rationale: '', tips: [] },
          { category: 'contingency', percent: 10, rationale: '', tips: [] },
        ],
        timeline: [],
        vendors: [],
        ideas: [],
        risks: [],
        confidence: 0.9,
      };

      const result = PlanResponseSchema.safeParse(invalidPlan);
      expect(result.success).toBe(false);
    });

    it('passes all fallback plans', () => {
      const briefWedding: Brief = {
        eventType: 'wedding',
        title: 'Wedding',
        eventDate: '2027-01-01',
        city: 'Mumbai',
        guestCount: 200,
        totalBudgetInr: 1500000,
        vibe: '',
        constraints: [],
        weddingFunctions: [],
        honoreeAge: null,
        communityKind: null,
      };
      const plan = buildFallbackPlan(briefWedding);
      expect(PlanResponseSchema.safeParse(plan).success).toBe(true);
    });
  });
});
