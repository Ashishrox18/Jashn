const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Formats rupee numbers according to Indian numbering system (e.g. ₹2,50,000)
 */
export function formatInr(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return inrFormatter.format(amount);
}

/**
 * Formats ISO YYYY-MM-DD to readable Indian/UK English date (e.g. 15 Nov 2026)
 */
export function formatDate(isoDate: string): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate;
  }
  const [yStr, mStr, dStr] = isoDate.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const mIndex = Number(mStr) - 1;
  const month = months[mIndex] ?? mStr;
  return `${Number(dStr)} ${month} ${yStr}`;
}

/**
 * Formats days until event into human relative text
 */
export function formatRelativeDays(days: number): string {
  if (days < 0) {
    const abs = Math.abs(days);
    return `${abs} day${abs === 1 ? '' : 's'} ago`;
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `${days} days to go`;
}

