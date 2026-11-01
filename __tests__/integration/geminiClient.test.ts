/**
 * @jest-environment node
 */
import { callGeminiStructured, AiError, cleanJsonText } from '@/lib/ai/gemini';
import { z } from 'zod';

const testSchema = z.object({
  greeting: z.string(),
  number: z.number(),
});

describe('Gemini Client', () => {
  const originalEnv = process.env;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'test-api-key',
      GEMINI_MODEL: 'gemini-3.6-flash',
      GEMINI_FALLBACK_MODEL: 'gemini-3.1-flash-lite',
    };
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sends the API key strictly in the x-goog-api-key header and NOT in the URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"greeting":"hello","number":42}' }] } }],
      }),
    });

    const result = await callGeminiStructured('prompt', testSchema);
    expect(result).toEqual({ greeting: 'hello', number: 42 });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [callUrl, callOptions] = mockFetch.mock.calls[0] as [string, RequestInit];

    // Assert key is NOT in URL query string
    expect(callUrl).not.toContain('test-api-key');
    expect(callUrl).not.toContain('key=');

    // Assert key is in headers
    const headers = callOptions.headers as Record<string, string>;
    expect(headers['x-goog-api-key']).toBe('test-api-key');
  });

  it('retries with fallback model when primary model returns 404', async () => {
    // 1st call fails with 404
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // 2nd call succeeds with fallback model
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"greeting":"fallback","number":100}' }] } }],
      }),
    });

    const result = await callGeminiStructured('prompt', testSchema);
    expect(result).toEqual({ greeting: 'fallback', number: 100 });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [firstUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
    const [secondUrl] = mockFetch.mock.calls[1] as [string, RequestInit];

    expect(firstUrl).toContain('gemini-3.6-flash');
    expect(secondUrl).toContain('gemini-3.1-flash-lite');
  });

  it('retries once with a repair prompt on malformed JSON, and throws BAD_OUTPUT if still invalid', async () => {
    // 1st attempt returns broken JSON
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'NOT VALID JSON' }] } }],
      }),
    });

    // 2nd repair attempt also returns invalid schema
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"wrong_key":"abc"}' }] } }],
      }),
    });

    await expect(callGeminiStructured('prompt', testSchema)).rejects.toThrow(AiError);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('strips code fences cleanly', () => {
    const wrapped = '```json\n{"a": 1}\n```';
    expect(cleanJsonText(wrapped)).toBe('{"a": 1}');
  });
});

