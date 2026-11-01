import 'server-only';
import { z } from 'zod';

export type AiErrorCode = 'NO_KEY' | 'RATE_LIMITED' | 'BAD_OUTPUT' | 'UNAVAILABLE';

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AiError';
    this.code = code;
  }
}

interface GenerateOptions {
  model?: string;
  timeoutMs?: number;
}

/**
 * Raw call to Gemini API using fetch with strict headers and timeout.
 */
async function fetchGemini(
  prompt: string,
  model: string,
  apiKey: string,
  timeoutMs = 25000
): Promise<{ text: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 404) {
      throw new Error('MODEL_NOT_FOUND');
    }
    if (res.status === 429) {
      throw new AiError('RATE_LIMITED', 'Gemini rate limit exceeded.');
    }
    if (!res.ok) {
      throw new AiError('UNAVAILABLE', `Gemini returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new AiError('BAD_OUTPUT', 'Empty output from Gemini');
    }

    return { text };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof AiError) {
      throw err;
    }
    if (err instanceof Error) {
      if (err.message === 'MODEL_NOT_FOUND') {
        throw err;
      }
      if (err.name === 'AbortError') {
        throw new AiError('UNAVAILABLE', 'AI request timed out after 25s');
      }
    }
    throw new AiError('UNAVAILABLE', 'Network error or service unavailable');
  }
}

/**
 * Alternative provider: Groq chat completion (JSON mode)
 * Enabled when GROQ_API_KEY is provided and GEMINI_API_KEY is not set.
 */
async function fetchGroq(
  prompt: string,
  groqKey: string,
  timeoutMs = 25000
): Promise<{ text: string }> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are Jashn, an expert Indian event planning assistant. Output ONLY valid JSON matching the user schema.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 8192,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 429) {
      throw new AiError('RATE_LIMITED', 'Groq rate limit exceeded');
    }
    if (!res.ok) {
      throw new AiError('UNAVAILABLE', `Groq returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new AiError('BAD_OUTPUT', 'Empty output from Groq');
    }

    return { text };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof AiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AiError('UNAVAILABLE', 'AI request timed out');
    }
    throw new AiError('UNAVAILABLE', 'Groq service error');
  }
}

/**
 * Dispatches AI call to configured provider (Gemini primary, with Groq support and fallback model).
 */
export async function executeAiCall(
  prompt: string,
  options?: GenerateOptions
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const primaryModel = options?.model || process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite';

  if (geminiKey && geminiKey.trim().length > 0 && geminiKey !== 'your_key_here') {
    try {
      const res = await fetchGemini(prompt, primaryModel, geminiKey, options?.timeoutMs);
      return res.text;
    } catch (err) {
      if (err instanceof Error && err.message === 'MODEL_NOT_FOUND') {
        // Retry once with fallback model
        const fallbackRes = await fetchGemini(prompt, fallbackModel, geminiKey, options?.timeoutMs);
        return fallbackRes.text;
      }
      throw err;
    }
  }

  if (groqKey && groqKey.trim().length > 0 && groqKey !== 'your_groq_key_here') {
    const res = await fetchGroq(prompt, groqKey, options?.timeoutMs);
    return res.text;
  }

  throw new AiError('NO_KEY', 'No valid AI API key configured in environment');
}

/**
 * Cleanly strips code blocks or stray markdown wrappers from model output.
 */
export function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  // Strip leading ```json or ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  }
  // Strip trailing ```
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Executes structured AI generation with Zod validation and a 1-time automatic repair retry.
 */
export async function callGeminiStructured<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options?: GenerateOptions
): Promise<T> {
  let rawText = '';
  try {
    rawText = await executeAiCall(prompt, options);
    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed);
  } catch (firstErr: unknown) {
    if (firstErr instanceof AiError && (firstErr.code === 'NO_KEY' || firstErr.code === 'RATE_LIMITED')) {
      throw firstErr;
    }

    // Attempt repair once
    try {
      if (firstErr instanceof z.ZodError) {
        console.warn('Schema validation issues:', JSON.stringify(firstErr.issues));
      } else {
        console.warn('First attempt error:', firstErr);
      }
      const repairPrompt = `${prompt}\n\nIMPORTANT: Your previous output was invalid JSON for the required schema. Fix errors: ${firstErr instanceof z.ZodError ? JSON.stringify(firstErr.issues) : 'Invalid format'}. Return ONLY valid, raw JSON.`;
      const repairedRaw = await executeAiCall(repairPrompt, options);
      const cleanedRepaired = cleanJsonText(repairedRaw);
      const parsedRepaired = JSON.parse(cleanedRepaired);
      return schema.parse(parsedRepaired);
    } catch (secondErr) {
      if (secondErr instanceof z.ZodError) {
        console.warn('Repair attempt also failed schema:', JSON.stringify(secondErr.issues));
      }
      throw new AiError('BAD_OUTPUT', 'AI output failed schema validation after repair attempt');
    }
  }
}

