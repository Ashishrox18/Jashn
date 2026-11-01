import { Category, BudgetLine } from '@/types';

export type LineStatus = 'ok' | 'warning' | 'over';

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  overCategories: Category[];
}

/**
 * Normalizes budget lines percentages so they sum to exactly 100.0%
 * using the largest remainder method with 1 decimal place precision (1000 tenths).
 */
export function normalizePercents(lines: BudgetLine[]): BudgetLine[] {
  if (lines.length === 0) return [];

  const totalSum = lines.reduce((acc, l) => acc + (l.percent > 0 ? l.percent : 0), 0);

  // If all percents are 0, distribute evenly
  if (totalSum === 0) {
    const n = lines.length;
    const baseTenths = Math.floor(1000 / n);
    const remainder = 1000 - baseTenths * n;
    return lines.map((line, idx) => ({
      ...line,
      percent: (baseTenths + (idx < remainder ? 1 : 0)) / 10,
    }));
  }

  // Calculate tenths (e.g. 10.5% = 105 tenths, target = 1000 tenths)
  const items = lines.map((line, index) => {
    const rawTenths = ((line.percent > 0 ? line.percent : 0) / totalSum) * 1000;
    const floorTenths = Math.floor(rawTenths);
    return {
      index,
      line,
      floorTenths,
      fraction: rawTenths - floorTenths,
    };
  });

  const currentTotal = items.reduce((acc, item) => acc + item.floorTenths, 0);
  const diff = 1000 - currentTotal;

  // Sort by fractional remainder descending, stable sort by index
  const sortedIndices = [...items]
    .sort((a, b) => {
      if (Math.abs(b.fraction - a.fraction) > 1e-9) {
        return b.fraction - a.fraction;
      }
      return a.index - b.index;
    })
    .map((item) => item.index);

  const bonusSet = new Set<number>(sortedIndices.slice(0, diff));

  return items.map((item) => ({
    ...item.line,
    percent: (item.floorTenths + (bonusSet.has(item.index) ? 1 : 0)) / 10,
  }));
}

/**
 * Ensures a contingency budget line of at least 5% is present,
 * deducting from the largest category if necessary.
 */
export function ensureContingency(lines: BudgetLine[]): BudgetLine[] {
  if (lines.length === 0) return [];

  const copy = lines.map((l) => ({ ...l }));
  const contingencyIndex = copy.findIndex((l) => l.category === 'contingency');

  if (contingencyIndex === -1) {
    // Find largest category
    let maxIdx = 0;
    for (let i = 1; i < copy.length; i++) {
      if ((copy[i]?.percent ?? 0) > (copy[maxIdx]?.percent ?? 0)) {
        maxIdx = i;
      }
    }
    const maxItem = copy[maxIdx];
    if (maxItem) {
      maxItem.percent = Math.max(0, maxItem.percent - 5);
    }
    copy.push({
      category: 'contingency',
      percent: 5,
      rationale: 'Safety buffer for unexpected expenses and price fluctuations',
      tips: ['Keep untouched until final 2 weeks', 'Use for vendor overages or emergency supplies'],
    });
  } else {
    const cont = copy[contingencyIndex];
    if (cont && cont.percent < 5) {
      const deficit = 5 - cont.percent;
      let maxIdx = 0;
      for (let i = 0; i < copy.length; i++) {
        if (i !== contingencyIndex && (copy[i]?.percent ?? 0) > (copy[maxIdx]?.percent ?? 0)) {
          maxIdx = i;
        }
      }
      const maxItem = copy[maxIdx];
      if (maxItem) {
        maxItem.percent = Math.max(0, maxItem.percent - deficit);
      }
      cont.percent = 5;
    }
  }

  return normalizePercents(copy);
}

/**
 * Converts budget lines to exact rupee amounts per category.
 * Amounts are rounded to the nearest ₹100, and adjusted so the sum EXACTLY equals totalInr.
 * Enforces contingency of at least 5%.
 */
export function allocate(
  totalInr: number,
  lines: BudgetLine[]
): Record<Category, number> {
  const result: Partial<Record<Category, number>> = {};
  if (lines.length === 0 || totalInr <= 0) {
    return result as Record<Category, number>;
  }

  // Ensure contingency >= 5% and normalized to 100%
  const preparedLines = ensureContingency(lines);

  // Target in units of ₹100
  const totalUnits = Math.floor(totalInr / 100);
  const remainderRupees = totalInr - totalUnits * 100;

  const allocationsWithRemainder = preparedLines.map((line, index) => {
    const rawUnits = (line.percent / 100) * totalUnits;
    const floorUnits = Math.floor(rawUnits);
    return {
      category: line.category,
      index,
      units: floorUnits,
      fraction: rawUnits - floorUnits,
    };
  });

  const sumFloorUnits = allocationsWithRemainder.reduce((sum, item) => sum + item.units, 0);
  const extraUnits = totalUnits - sumFloorUnits;

  // Distribute extra units using largest-remainder
  const sorted = [...allocationsWithRemainder].sort((a, b) => {
    if (Math.abs(b.fraction - a.fraction) > 1e-9) {
      return b.fraction - a.fraction;
    }
    return a.index - b.index;
  });

  const bonusIndices = new Set<number>(sorted.slice(0, extraUnits).map((s) => s.index));

  for (const item of allocationsWithRemainder) {
    const units = item.units + (bonusIndices.has(item.index) ? 1 : 0);
    result[item.category] = units * 100;
  }

  // If totalInr had a remainder < 100 (e.g. ₹50,250), add to the category with highest allocation
  if (remainderRupees > 0) {
    let highestCat: Category = preparedLines[0]!.category;
    let highestVal = -1;
    for (const line of preparedLines) {
      const val = result[line.category] ?? 0;
      if (val > highestVal) {
        highestVal = val;
        highestCat = line.category;
      }
    }
    result[highestCat] = (result[highestCat] ?? 0) + remainderRupees;
  }

  return result as Record<Category, number>;
}

/**
 * What-if budget rebalancing: moves amount from one category to another.
 * Never drops below 0, never changes total. Pure and immutable.
 */
export function rebalance(
  allocations: Record<Category, number>,
  fromCategory: Category,
  toCategory: Category,
  amountInr: number
): Record<Category, number> {
  const next = { ...allocations };
  if (fromCategory === toCategory || amountInr <= 0) {
    return next;
  }

  const currentFrom = next[fromCategory] ?? 0;
  const currentTo = next[toCategory] ?? 0;

  const transferable = Math.min(currentFrom, Math.round(amountInr));
  next[fromCategory] = currentFrom - transferable;
  next[toCategory] = currentTo + transferable;

  return next;
}

/**
 * Line status:
 * 'ok' (< 90%)
 * 'warning' (90% - 100%)
 * 'over' (> 100%)
 */
export function lineStatus(allocated: number, spent: number): LineStatus {
  if (allocated <= 0) {
    return spent > 0 ? 'over' : 'ok';
  }
  const ratio = (spent / allocated) * 100;
  // Use precision tolerance for floating point boundary at 90.0% and 100.0%
  if (ratio < 90) {
    return 'ok';
  }
  if (ratio <= 100) {
    return 'warning';
  }
  return 'over';
}

/**
 * Summarizes the entire budget status
 */
export function summarize(
  allocations: Record<Category, number>,
  spentByCategory: Record<Category, number>
): BudgetSummary {
  let totalAllocated = 0;
  let totalSpent = 0;
  const overCategories: Category[] = [];

  for (const cat of Object.keys(allocations) as Category[]) {
    const allocated = allocations[cat] ?? 0;
    const spent = spentByCategory[cat] ?? 0;
    totalAllocated += allocated;
    totalSpent += spent;

    if (lineStatus(allocated, spent) === 'over') {
      overCategories.push(cat);
    }
  }

  const remaining = totalAllocated - totalSpent;
  const percentUsed = totalAllocated > 0 ? Number(((totalSpent / totalAllocated) * 100).toFixed(1)) : 0;

  return {
    totalAllocated,
    totalSpent,
    remaining,
    percentUsed,
    overCategories,
  };
}
