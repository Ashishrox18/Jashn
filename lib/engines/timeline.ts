import { Task } from '@/types';

export interface ScheduledTask extends Task {
  dueDate: string;
}

export interface SchedulingResult {
  scheduled: ScheduledTask[];
  compressed: boolean;
}

/**
 * Parses a YYYY-MM-DD string into UTC epoch milliseconds.
 */
export function parseUtcDate(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  return Date.UTC(y, m - 1, d);
}

/**
 * Formats a UTC timestamp into YYYY-MM-DD.
 */
export function formatUtcDate(epochMs: number): string {
  const d = new Date(epochMs);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string in UTC.
 */
export function addDaysUtc(dateStr: string, days: number): string {
  const ms = parseUtcDate(dateStr);
  const newMs = ms + days * 86_400_000;
  return formatUtcDate(newMs);
}

/**
 * Returns difference in whole days between eventDate and today (eventDate - today).
 */
export function daysUntil(eventDate: string, today: string): number {
  const ms1 = parseUtcDate(eventDate);
  const ms2 = parseUtcDate(today);
  return Math.round((ms1 - ms2) / 86_400_000);
}

/**
 * Returns human-readable planning phase based on days until event.
 */
export function phase(days: number): string {
  if (days < 0) return 'Past';
  if (days === 0) return 'Event day';
  if (days <= 13) return 'Final stretch';
  if (days <= 59) return 'Lock the details';
  if (days <= 180) return 'Book the big things';
  return 'Dream & decide';
}

/**
 * Schedules tasks against the event date and today.
 * If the event is sooner than the plan assumes, compresses the timeline proportionally.
 * Tasks never get a due date before today or after eventDate.
 */
export function scheduleTasks(
  tasks: Task[],
  eventDate: string,
  today: string
): SchedulingResult {
  if (tasks.length === 0) {
    return { scheduled: [], compressed: false };
  }

  const daysDiff = daysUntil(eventDate, today);
  const totalDaysAvailable = Math.max(0, daysDiff);

  const maxPlannedDays = Math.max(
    ...tasks.map((t) => t.weeksBefore * 7),
    0
  );

  const needsCompression = totalDaysAvailable > 0 && maxPlannedDays > totalDaysAvailable;

  const scheduled: ScheduledTask[] = tasks.map((task) => {
    let dueDate: string;

    if (totalDaysAvailable === 0) {
      // Event is today or in the past
      dueDate = eventDate;
    } else if (needsCompression) {
      const plannedOffset = task.weeksBefore * 7;
      // Proportional compression: scale planned offset to available days
      const compressedOffset = maxPlannedDays > 0
        ? Math.round((plannedOffset / maxPlannedDays) * totalDaysAvailable)
        : 0;
      dueDate = addDaysUtc(eventDate, -compressedOffset);
    } else {
      // Normal schedule: eventDate - weeksBefore * 7 days
      dueDate = addDaysUtc(eventDate, -task.weeksBefore * 7);
    }

    // Clamp: never before today, never after eventDate
    if (daysDiff > 0) {
      if (dueDate < today) {
        dueDate = today;
      }
      if (dueDate > eventDate) {
        dueDate = eventDate;
      }
    }

    return {
      ...task,
      dueDate,
    };
  });

  // Sort scheduled tasks chronologically by dueDate
  scheduled.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return {
    scheduled,
    compressed: needsCompression,
  };
}

/**
 * Checks if a task is overdue.
 */
export function isOverdue(
  task: ScheduledTask,
  today: string,
  completedIds: string[]
): boolean {
  if (completedIds.includes(task.id)) {
    return false;
  }
  return task.dueDate < today;
}

/**
 * Returns the next N tasks to focus on, sorted by dueDate asc then priority.
 */
export function nextTasks(
  scheduled: ScheduledTask[],
  completedIds: string[],
  n: number
): ScheduledTask[] {
  const priorityWeight: Record<string, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const pending = scheduled.filter((t) => !completedIds.includes(t.id));

  pending.sort((a, b) => {
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    const weightA = priorityWeight[a.priority] ?? 2;
    const weightB = priorityWeight[b.priority] ?? 2;
    return weightA - weightB;
  });

  return pending.slice(0, n);
}

/**
 * Groups scheduled tasks by Month Year (e.g., "November 2026")
 */
export function groupByMonth(
  scheduled: ScheduledTask[]
): Record<string, ScheduledTask[]> {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const groups: Record<string, ScheduledTask[]> = {};

  for (const task of scheduled) {
    const [yStr, mStr] = task.dueDate.split('-');
    const year = Number(yStr);
    const monthIndex = Number(mStr) - 1;
    const label = `${monthNames[monthIndex] ?? ''} ${year}`;

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label]!.push(task);
  }

  return groups;
}
