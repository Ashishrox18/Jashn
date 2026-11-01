import { sanitizeText } from '@/lib/sanitize';

describe('Sanitize Utility', () => {
  it('strips HTML tags and script injections', () => {
    const malicious = '<script>alert("hack")</script>Hello <b>World</b><img src=x onerror=alert(1)>';
    expect(sanitizeText(malicious)).toBe('Hello World');
  });

  it('strips non-printable ASCII control characters', () => {
    const withControls = 'Clean\x00text\x07with\x1Fcontrol\x7Fchars';
    expect(sanitizeText(withControls)).toBe('Cleantextwithcontrolchars');
  });

  it('collapses multiple whitespace and trims edges', () => {
    const raw = '   Multi   line \n\n  spaces   here   ';
    expect(sanitizeText(raw)).toBe('Multi line spaces here');
  });

  it('enforces maximum length limit', () => {
    const long = 'A'.repeat(600);
    expect(sanitizeText(long, 500).length).toBe(500);
  });

  it('handles non-string inputs gracefully', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(12345)).toBe('');
  });
});
