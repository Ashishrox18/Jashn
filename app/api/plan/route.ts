import { NextRequest, NextResponse } from 'next/server';
import { PlanRequestSchema } from '@/schemas/api';
import { PlanResponseSchema } from '@/schemas/plan';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/sanitize';
import { buildPlanPrompt } from '@/lib/ai/prompts';
import { callGeminiStructured, AiError } from '@/lib/ai/gemini';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request payload' },
      { status: 400 }
    );
  }

  const parsed = PlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Invalid request body';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { brief, userId } = parsed.data;

  // Rate limiting: 10 requests/min
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimitKey = `${userId}:${ip}`;
  const rateCheck = checkRateLimit(rateLimitKey);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSeconds),
        },
      }
    );
  }

  // Sanitize free text
  const sanitizedBrief = {
    ...brief,
    title: sanitizeText(brief.title, 80),
    city: sanitizeText(brief.city, 60),
    vibe: sanitizeText(brief.vibe, 500),
  };

  try {
    const prompt = buildPlanPrompt(sanitizedBrief);
    const plan = await callGeminiStructured(prompt, PlanResponseSchema);
    return NextResponse.json(plan, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof AiError) {
      if (err.code === 'NO_KEY') {
        return NextResponse.json(
          { error: 'AI service not configured', code: 'NO_KEY' },
          { status: 503 }
        );
      }
      if (err.code === 'RATE_LIMITED') {
        return NextResponse.json(
          { error: 'AI service rate limited', code: 'RATE_LIMITED' },
          { status: 429, headers: { 'Retry-After': '10' } }
        );
      }
      if (err.code === 'BAD_OUTPUT') {
        return NextResponse.json(
          { error: 'AI produced unparseable plan data', code: 'BAD_OUTPUT' },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: 'AI service temporarily unavailable', code: 'UNAVAILABLE' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the plan.' },
      { status: 500 }
    );
  }
}

