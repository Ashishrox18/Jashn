import { buildIcs, escapeIcsText, foldLine, toIcsDate, getNextDayIcsDate } from '@/lib/engines/ics';
import { ScheduledTask } from '@/lib/engines/timeline';

describe('ICS Calendar Export Engine', () => {
  it('handles getNextDayIcsDate gracefully', () => {
    expect(getNextDayIcsDate('2026-11-20')).toBe('20261121');
    expect(getNextDayIcsDate('invalid')).toBe('invalid');
  });
  const sampleTasks: ScheduledTask[] = [
    {
      id: 'task-1',
      title: 'Book Catering & Tasting, Menu Selection',
      details: 'Check vegetarian options; confirm dessert items; note: no peanuts.',
      category: 'catering',
      priority: 'high',
      weeksBefore: 8,
      dueDate: '2026-10-01',
    },
    {
      id: 'task-2',
      title: 'Finalize Stage Decor',
      details: 'Ensure flowers are fresh\nStage backdrop height 12ft\nBackdrop width 24ft',
      category: 'decor',
      priority: 'medium',
      weeksBefore: 4,
      dueDate: '2026-10-25',
    },
  ];

  it('escapes special characters correctly according to RFC 5545', () => {
    const raw = 'Text with \\ backslash, comma, semicolon; and \n newline.';
    const escaped = escapeIcsText(raw);
    expect(escaped).toBe('Text with \\\\ backslash\\, comma\\, semicolon\\; and \\n newline.');
  });

  it('folds lines exceeding 75 octets with CRLF followed by space', () => {
    const longLine = 'DESCRIPTION:This is an extremely long description that will definitely exceed the standard seventy-five byte limit specified by RFC 5545 calendar standard.';
    const folded = foldLine(longLine);
    const parts = folded.split('\r\n');
    expect(parts.length).toBeGreaterThan(1);
    for (let i = 1; i < parts.length; i++) {
      expect(parts[i]?.startsWith(' ')).toBe(true);
    }
  });

  it('formats dates as YYYYMMDD', () => {
    expect(toIcsDate('2026-11-20')).toBe('20261120');
  });

  it('generates a valid RFC 5545 string with CRLF endings and all components', () => {
    const ics = buildIcs('Aarav & Diya Wedding', sampleTasks, '2026-11-20');

    // CRLF line endings
    expect(ics.includes('\r\n')).toBe(true);

    // Required header lines
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Jashn//Event Planning Engine//EN');
    expect(ics).toContain('CALSCALE:GREGORIAN');
    expect(ics).toContain('METHOD:PUBLISH');
    expect(ics).toContain('END:VCALENDAR');

    // Contains one VEVENT per task plus one for event day (total 3)
    const veventMatches = ics.match(/BEGIN:VEVENT/g);
    expect(veventMatches?.length).toBe(sampleTasks.length + 1);

    // Checks all-day date format DTSTART;VALUE=DATE:
    expect(ics).toContain('DTSTART;VALUE=DATE:20261120');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261001');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261025');

    // Unique UIDs
    const uids = ics
      .split('\r\n')
      .filter((line) => line.startsWith('UID:'))
      .map((l) => l.slice(4));
    expect(uids.length).toBe(3);
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(3);
  });
});
