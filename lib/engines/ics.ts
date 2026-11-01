import { ScheduledTask } from './timeline';

/**
 * Escapes special characters for iCalendar text fields according to RFC 5545:
 * Backslash, semicolon, comma, and newline.
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

/**
 * Folds a single iCalendar content line to adhere to the 75-octet limit per RFC 5545.
 * Continuation lines begin with a single space.
 */
export function foldLine(line: string): string {
  // If line length in bytes <= 75, return as is
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) {
    return line;
  }

  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;
  let maxBytes = 75;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (currentBytes + charBytes > maxBytes) {
      parts.push(current);
      current = ' ' + char;
      currentBytes = 1 + charBytes;
      maxBytes = 74; // continuation line includes leading space
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current.length > 0) {
    parts.push(current);
  }

  return parts.join('\r\n');
}

/**
 * Converts YYYY-MM-DD to YYYYMMDD
 */
export function toIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/**
 * Calculates next day in YYYYMMDD for all-day DTEND requirement in RFC 5545.
 */
export function getNextDayIcsDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    return toIcsDate(isoDate);
  }
  const nextMs = Date.UTC(y, m - 1, d) + 86_400_000;
  const nextDate = new Date(nextMs);
  const nextY = nextDate.getUTCFullYear();
  const nextM = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const nextD = String(nextDate.getUTCDate()).padStart(2, '0');
  return `${nextY}${nextM}${nextD}`;
}

/**
 * Builds a valid RFC 5545 iCalendar string.
 */
export function buildIcs(
  eventTitle: string,
  scheduledTasks: ScheduledTask[],
  eventDate: string
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jashn//Event Planning Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // 1. VEVENT for Main Event Day
  const eventStart = toIcsDate(eventDate);
  const eventEnd = getNextDayIcsDate(eventDate);
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:event-${eventStart}@jashn.app`);
  lines.push(`DTSTAMP:${eventStart}T000000Z`);
  lines.push(`DTSTART;VALUE=DATE:${eventStart}`);
  lines.push(`DTEND;VALUE=DATE:${eventEnd}`);
  lines.push(`SUMMARY:${escapeIcsText(`🎉 ${eventTitle} (Event Day)`)}`);
  lines.push(`DESCRIPTION:${escapeIcsText(`Main celebration day for ${eventTitle} planned with Jashn.`)}`);
  lines.push('STATUS:CONFIRMED');
  lines.push('TRANSP:TRANSPARENT');
  lines.push('END:VEVENT');

  // 2. VEVENT for each scheduled task
  for (const task of scheduledTasks) {
    const taskStart = toIcsDate(task.dueDate);
    const taskEnd = getNextDayIcsDate(task.dueDate);
    const cleanId = task.id.replace(/[^a-zA-Z0-9_-]/g, '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:task-${cleanId}-${taskStart}@jashn.app`);
    lines.push(`DTSTAMP:${taskStart}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${taskStart}`);
    lines.push(`DTEND;VALUE=DATE:${taskEnd}`);
    lines.push(`SUMMARY:${escapeIcsText(`[Jashn] ${task.title}`)}`);
    lines.push(
      `DESCRIPTION:${escapeIcsText(
        `Category: ${task.category.toUpperCase()}\\nPriority: ${task.priority.toUpperCase()}\\n\\nDetails: ${task.details}`
      )}`
    );
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // Fold long lines and join with CRLF
  const foldedLines = lines.map(foldLine);
  return foldedLines.join('\r\n') + '\r\n';
}
