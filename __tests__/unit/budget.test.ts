import {
  normalizePercents,
  ensureContingency,
  allocate,
  rebalance,
  lineStatus,
  summarize,
} from '@/lib/engines/budget';
import { BudgetLine, Category } from '@/types';

const sampleLines: BudgetLine[] = [
  { category: 'venue', percent: 25, rationale: 'Core hall', tips: ['Book early'] },
  { category: 'catering', percent: 35, rationale: 'Food & drinks', tips: ['Tasting first'] },
  { category: 'decor', percent: 15, rationale: 'Floral styling', tips: ['Local flowers'] },
  { category: 'photography', percent: 10, rationale: 'Photo + video', tips: ['Verify drone policy'] },
  { category: 'entertainment', percent: 10, rationale: 'DJ / music', tips: ['Sound check'] },
  { category: 'contingency', percent: 5, rationale: 'Buffer', tips: ['Emergency fund'] },
];

describe('Budget Engine', () => {
  describe('normalizePercents', () => {
    it('returns empty array when given empty input', () => {
      expect(normalizePercents([])).toEqual([]);
    });

    it('distributes evenly when all percents are 0', () => {
      const zeroLines: BudgetLine[] = [
        { category: 'venue', percent: 0, rationale: '', tips: [] },
        { category: 'catering', percent: 0, rationale: '', tips: [] },
        { category: 'decor', percent: 0, rationale: '', tips: [] },
      ];
      const normalized = normalizePercents(zeroLines);
      const sum = normalized.reduce((acc, l) => acc + l.percent, 0);
      expect(sum).toBeCloseTo(100, 5);
      // 3 categories: 33.4 + 33.3 + 33.3 = 100.0
      expect(normalized.map((l) => l.percent)).toEqual([33.4, 33.3, 33.3]);
    });

    it('rescales varied percentages so the sum is exactly 100.0', () => {
      const inputs: number[][] = [
        [33, 33, 33],
        [10, 20, 30, 40, 50],
        [12.34, 45.67, 8.91, 23.45],
        [1, 1, 1, 1, 1, 1, 1],
      ];

      for (const vals of inputs) {
        const lines: BudgetLine[] = vals.map((p, i) => ({
          category: (['venue', 'catering', 'decor', 'photography', 'entertainment', 'gifts', 'logistics'][i] ?? 'other') as Category,
          percent: p,
          rationale: '',
          tips: [],
        }));
        const normalized = normalizePercents(lines);
        const sum = Math.round(normalized.reduce((acc, l) => acc + l.percent * 10, 0)) / 10;
        expect(sum).toBe(100.0);
      }
    });

    it('preserves single decimal place precision', () => {
      const lines: BudgetLine[] = [
        { category: 'venue', percent: 33.3333, rationale: '', tips: [] },
        { category: 'catering', percent: 33.3333, rationale: '', tips: [] },
        { category: 'decor', percent: 33.3334, rationale: '', tips: [] },
      ];
      const normalized = normalizePercents(lines);
      for (const line of normalized) {
        const decimals = (line.percent.toString().split('.')[1] || '').length;
        expect(decimals).toBeLessThanOrEqual(1);
      }
      const sum = normalized.reduce((acc, l) => acc + l.percent, 0);
      expect(Math.round(sum * 10) / 10).toBe(100.0);
    });
  });

  describe('ensureContingency', () => {
    it('adds 5% contingency when missing, deducted from largest category', () => {
      const linesWithoutContingency: BudgetLine[] = [
        { category: 'venue', percent: 60, rationale: '', tips: [] },
        { category: 'catering', percent: 40, rationale: '', tips: [] },
      ];
      const ensured = ensureContingency(linesWithoutContingency);
      const cont = ensured.find((l) => l.category === 'contingency');
      expect(cont).toBeDefined();
      expect(cont!.percent).toBeGreaterThanOrEqual(5);

      const sum = ensured.reduce((acc, l) => acc + l.percent, 0);
      expect(Math.round(sum * 10) / 10).toBe(100);
    });

    it('tops up contingency if it is below 5%', () => {
      const linesWithLowContingency: BudgetLine[] = [
        { category: 'venue', percent: 70, rationale: '', tips: [] },
        { category: 'catering', percent: 28, rationale: '', tips: [] },
        { category: 'contingency', percent: 2, rationale: '', tips: [] },
      ];
      const ensured = ensureContingency(linesWithLowContingency);
      const cont = ensured.find((l) => l.category === 'contingency');
      expect(cont!.percent).toBeGreaterThanOrEqual(5);
    });
  });

  describe('allocate', () => {
    it('returns empty record for 0 or negative budget', () => {
      expect(allocate(0, sampleLines)).toEqual({});
      expect(allocate(-100, sampleLines)).toEqual({});
    });

    it('allocates amounts in multiples of 100 summing EXACTLY to totalInr (loop test over 50 totals)', () => {
      const testTotals = [
        5000, 10000, 25000, 50000, 75000, 100000, 250000, 500000, 1000000, 2500000, 10000000,
      ];
      // Generate 40 random realistic totals
      for (let i = 0; i < 40; i++) {
        testTotals.push(Math.floor(Math.random() * 9900000) + 10000);
      }

      for (const total of testTotals) {
        const allocations = allocate(total, sampleLines);
        const sum = Object.values(allocations).reduce((a, b) => a + b, 0);
        expect(sum).toBe(total);

        // Every category must be non-negative
        for (const [cat, amt] of Object.entries(allocations)) {
          expect(amt).toBeGreaterThanOrEqual(0);
        }

        // Contingency must be present and >= 5% of total
        const contingencyAmt = allocations['contingency'] ?? 0;
        expect(contingencyAmt).toBeGreaterThanOrEqual(Math.floor((total * 0.05) / 100) * 100);
      }
    });

    it('handles totals with non-100 remainders while preserving exact sum', () => {
      const oddTotal = 123456;
      const allocations = allocate(oddTotal, sampleLines);
      const sum = Object.values(allocations).reduce((a, b) => a + b, 0);
      expect(sum).toBe(oddTotal);
    });
  });

  describe('rebalance', () => {
    const baseAllocations: Record<Category, number> = {
      venue: 100000,
      catering: 150000,
      decor: 50000,
      photography: 40000,
      entertainment: 30000,
      attire: 20000,
      invitations: 10000,
      transport: 10000,
      accommodation: 0,
      gifts: 10000,
      logistics: 10000,
      permissions: 0,
      contingency: 25000,
      other: 0,
    };

    it('is immutable and preserves total sum', () => {
      const totalBefore = Object.values(baseAllocations).reduce((a, b) => a + b, 0);
      const updated = rebalance(baseAllocations, 'venue', 'catering', 20000);

      expect(baseAllocations['venue']).toBe(100000); // unchanged
      expect(updated['venue']).toBe(80000);
      expect(updated['catering']).toBe(170000);

      const totalAfter = Object.values(updated).reduce((a, b) => a + b, 0);
      expect(totalAfter).toBe(totalBefore);
    });

    it('never allows a category to drop below 0 (clamps transfer)', () => {
      const updated = rebalance(baseAllocations, 'venue', 'decor', 150000); // venue only has 100000
      expect(updated['venue']).toBe(0);
      expect(updated['decor']).toBe(150000); // 50000 + 100000
    });

    it('ignores negative transfer amounts or same category', () => {
      const updatedSame = rebalance(baseAllocations, 'venue', 'venue', 10000);
      expect(updatedSame['venue']).toBe(100000);

      const updatedNeg = rebalance(baseAllocations, 'venue', 'decor', -5000);
      expect(updatedNeg['venue']).toBe(100000);
    });
  });

  describe('lineStatus', () => {
    it('correctly evaluates boundary conditions', () => {
      // allocated 100,000
      // 89.9% -> ok
      expect(lineStatus(100000, 89900)).toBe('ok');

      // 90.0% -> warning
      expect(lineStatus(100000, 90000)).toBe('warning');

      // 95.0% -> warning
      expect(lineStatus(100000, 95000)).toBe('warning');

      // 100.0% -> warning
      expect(lineStatus(100000, 100000)).toBe('warning');

      // 100.1% -> over
      expect(lineStatus(100000, 100100)).toBe('over');

      // 120.0% -> over
      expect(lineStatus(100000, 120000)).toBe('over');
    });

    it('handles zero allocation', () => {
      expect(lineStatus(0, 0)).toBe('ok');
      expect(lineStatus(0, 100)).toBe('over');
    });
  });

  describe('summarize', () => {
    it('summarizes total allocated, spent, remaining, and identifies over categories', () => {
      const allocations: Record<Category, number> = {
        venue: 100000,
        catering: 200000,
        decor: 50000,
        photography: 0,
        entertainment: 0,
        attire: 0,
        invitations: 0,
        transport: 0,
        accommodation: 0,
        gifts: 0,
        logistics: 0,
        permissions: 0,
        contingency: 50000,
        other: 0,
      };

      const spent: Record<Category, number> = {
        venue: 95000, // warning
        catering: 220000, // over
        decor: 30000, // ok
        photography: 0,
        entertainment: 0,
        attire: 0,
        invitations: 0,
        transport: 0,
        accommodation: 0,
        gifts: 0,
        logistics: 0,
        permissions: 0,
        contingency: 0,
        other: 0,
      };

      const summary = summarize(allocations, spent);
      expect(summary.totalAllocated).toBe(400000);
      expect(summary.totalSpent).toBe(345000);
      expect(summary.remaining).toBe(55000);
      expect(summary.percentUsed).toBe(86.3);
      expect(summary.overCategories).toEqual(['catering']);
    });
  });
});

