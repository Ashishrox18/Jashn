/**
 * Sanitizes user-provided free text (e.g. vibe, notes, questions).
 * Strips script/style blocks, HTML tags, removes control characters, collapses whitespace, and enforces max length.
 */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Strip script and style blocks completely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Strip non-printable ASCII control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    // Trim edges
    .trim()
    // Enforce length limit
    .slice(0, maxLength);
}
