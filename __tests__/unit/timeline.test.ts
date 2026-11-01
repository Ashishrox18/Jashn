import {
  daysUntil,
  phase,
  scheduleTasks,
  isOverdue,
  nextTasks,
  groupByMonth,
  addDaysUtc,
} from '@/lib/engines/timeline';
import { Task } from '@/types';

const sampleTasks: Task[] = [
  { id: 't1', title: 'Book Venue', details: 'Finalize hall', category: 'venue', priority: 'high', weeksBefore: 20 },
  { id: 't2', title: 'Hire Caterer', details: 'Menu tasting', category: 'catering', priority: 'high', weeksBefore: 12 },
  { id: 't3', title: 'Send Invites', details: 'Digital cards', category: 'invitations', priority: 'medium', weeksBefore: 6 },
  { id: 't4', title: 'Final Fittings', details: 'Attire check', category: 'attire', priority: 'low', weeksBefore: 2 },
  { id: 't5', title: 'Rehearsal', details: 'Sound check', category: 'entertainment', priority: 'medium', weeksBefore: 1 },
];

describe('Timeline Engine', () => {
  describe('daysUntil', () => {
    it('throws error on invalid date string format', () => {
      expect(() => daysUntil('invalid', '2026-11-01')).toThrow();
    });

    it('calculates days correctly across months', () => {
      expect(daysUntil('2026-12-31', '2026-12-01')).toBe(30);
      expect(daysUntil('2027-01-05', '2026-12-31')).toBe(5);
    });

    it('handles leap years accurately (e.g. Feb 2028 has 29 days)', () => {
      // 2028 is a leap year
      expect(daysUntil('2028-03-01', '2028-02-28')).toBe(2);
      expect(daysUntil('2028-03-01', '2028-02-01')).toBe(29);
      // Non-leap year 2027
      expect(daysUntil('2027-03-01', '2027-02-28')).toBe(1);
    });

    it('returns 0 for same day and negative for past dates', () => {
      expect(daysUntil('2026-11-01', '2026-11-01')).toBe(0);
      expect(daysUntil('2026-10-31', '2026-11-01')).toBe(-1);
    });
  });

  describe('phase', () => {
    it('returns exact phase according to boundary specifications', () => {
      expect(phase(200)).toBe('Dream & decide');
      expect(phase(181)).toBe('Dream & decide');
      expect(phase(180)).toBe('Book the big things');
      expect(phase(60)).toBe('Book the big things');
      expect(phase(59)).toBe('Lock the details');
      expect(phase(14)).toBe('Lock the details');
      expect(phase(13)).toBe('Final stretch');
      expect(phase(1)).toBe('Final stretch');
      expect(phase(0)).toBe('Event day');
      expect(phase(-5)).toBe('Past');
    });
  });

  describe('scheduleTasks', () => {
    it('schedules normally when enough time is available', () => {
      const today = '2026-01-01';
      const eventDate = '2026-12-01'; // ~47 weeks away
      const result = scheduleTasks(sampleTasks, eventDate, today);

      expect(result.compressed).toBe(false);
      expect(result.scheduled.length).toBe(sampleTasks.length);

      const venueTask = result.scheduled.find((t) => t.id === 't1');
      // 20 weeks before 2026-12-01: 20 * 7 = 140 days
      expect(venueTask?.dueDate).toBe(addDaysUtc(eventDate, -140));
    });

    it('compresses timeline when event is in 10 days and tasks assume weeks before', () => {
      const today = '2026-11-01';
      const eventDate = '2026-11-11'; // 10 days away
      const result = scheduleTasks(sampleTasks, eventDate, today);

      expect(result.compressed).toBe(true);

      for (const t of result.scheduled) {
        // Must be between today and eventDate
        expect(t.dueDate >= today).toBe(true);
        expect(t.dueDate <= eventDate).toBe(true);
      }

      // Check earliest task (venue, 20 weeks) is mapped to today
      const earliest = result.scheduled[0];
      expect(earliest?.dueDate).toBe(today);
    });

    it('never assigns a due date before today or after eventDate', () => {
      const today = '2026-06-01';
      const eventDate = '2026-07-01'; // 30 days away, but task assumes 20 weeks (~140 days)
      const result = scheduleTasks(sampleTasks, eventDate, today);

      for (const t of result.scheduled) {
        expect(t.dueDate >= today).toBe(true);
        expect(t.dueDate <= eventDate).toBe(true);
      }
    });

    it('handles empty tasks list', () => {
      const result = scheduleTasks([], '2026-12-01', '2026-01-01');
      expect(result.scheduled).toEqual([]);
      expect(result.compressed).toBe(false);
    });

    it('handles event date on or before today', () => {
      const result = scheduleTasks(sampleTasks, '2026-11-01', '2026-11-01');
      expect(result.scheduled.length).toBe(sampleTasks.length);
      for (const t of result.scheduled) {
        expect(t.dueDate).toBe('2026-11-01');
      }
    });
  });

  describe('isOverdue', () => {
    const task = {
      ...sampleTasks[0]!,
      dueDate: '2026-10-15',
    };

    it('marks pending tasks before today as overdue', () => {
      expect(isOverdue(task, '2026-10-16', [])).toBe(true);
    });

    it('does not mark completed tasks as overdue', () => {
      expect(isOverdue(task, '2026-10-16', ['t1'])).toBe(false);
    });

    it('does not mark future or same day tasks as overdue', () => {
      expect(isOverdue(task, '2026-10-15', [])).toBe(false);
      expect(isOverdue(task, '2026-10-14', [])).toBe(false);
    });
  });

  describe('nextTasks', () => {
    it('orders tasks by dueDate ascending, then by priority (high > medium > low)', () => {
      const scheduled = [
        { ...sampleTasks[2]!, dueDate: '2026-11-05' }, // medium
        { ...sampleTasks[1]!, dueDate: '2026-11-05' }, // high
        { ...sampleTasks[0]!, dueDate: '2026-11-02' }, // high
        { ...sampleTasks[3]!, dueDate: '2026-11-06' }, // low
      ];

      const next = nextTasks(scheduled, [], 3);
      expect(next.length).toBe(3);
      expect(next[0]?.id).toBe('t1'); // earlier date
      expect(next[1]?.id).toBe('t2'); // same date as t3, but high priority
      expect(next[2]?.id).toBe('t3'); // medium priority
    });

    it('filters out completed tasks', () => {
      const scheduled = [
        { ...sampleTasks[0]!, dueDate: '2026-11-02' },
        { ...sampleTasks[1]!, dueDate: '2026-11-03' },
      ];
      const next = nextTasks(scheduled, ['t1'], 3);
      expect(next.map((t) => t.id)).toEqual(['t2']);
    });
  });

  describe('groupByMonth', () => {
    it('groups tasks chronologically by Month Year label', () => {
      const scheduled = [
        { ...sampleTasks[0]!, dueDate: '2026-08-15' },
        { ...sampleTasks[1]!, dueDate: '2026-08-25' },
        { ...sampleTasks[2]!, dueDate: '2026-09-10' },
      ];

      const grouped = groupByMonth(scheduled);
      expect(Object.keys(grouped)).toEqual(['August 2026', 'September 2026']);
      expect(grouped['August 2026']?.length).toBe(2);
      expect(grouped['September 2026']?.length).toBe(1);
    });
  });
});
