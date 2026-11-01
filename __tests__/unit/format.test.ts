import { formatInr, formatDate, formatRelativeDays } from '@/lib/format';

describe('Format Utilities', () => {
  describe('formatInr', () => {
    it('formats numbers to Indian Rupee currency string', () => {
      const res = formatInr(250000);
      expect(res).toContain('2,50,000');
    });

    it('handles NaN, null, and undefined safely', () => {
      expect(formatInr(NaN)).toBe('₹0');
      // @ts-expect-error testing invalid inputs
      expect(formatInr(null)).toBe('₹0');
      // @ts-expect-error testing invalid inputs
      expect(formatInr(undefined)).toBe('₹0');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates into readable UK/Indian format', () => {
      expect(formatDate('2026-11-15')).toBe('15 Nov 2026');
      expect(formatDate('2027-01-01')).toBe('1 Jan 2027');
    });

    it('returns raw string if not matching ISO format', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatRelativeDays', () => {
    it('formats past dates', () => {
      expect(formatRelativeDays(-1)).toBe('1 day ago');
      expect(formatRelativeDays(-5)).toBe('5 days ago');
    });

    it('formats today and tomorrow', () => {
      expect(formatRelativeDays(0)).toBe('Today');
      expect(formatRelativeDays(1)).toBe('Tomorrow');
    });

    it('formats future days', () => {
      expect(formatRelativeDays(10)).toBe('10 days to go');
    });
  });
});

