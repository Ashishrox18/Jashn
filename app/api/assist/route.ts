import { NextRequest, NextResponse } from 'next/server';
import { AssistRequestSchema } from '@/schemas/api';
import { AssistResponseSchema } from '@/schemas/plan';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/sanitize';
import { buildAssistPrompt } from '@/lib/ai/prompts';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildFallbackAssist } from '@/lib/fallbackPlan';

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

  const parsed = AssistRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Invalid request body';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { question, brief, planSummary, spentTotalInr, userId } = parsed.data;

  // Rate limiting (generous in development)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimitKey = `assist:${userId}:${ip}`;
  const rateCheck = checkRateLimit(rateLimitKey);

  // Sanitize free text
  const sanitizedQuestion = sanitizeText(question, 400);
  const sanitizedBrief = {
    ...brief,
    title: sanitizeText(brief.title, 80),
    city: sanitizeText(brief.city, 60),
    vibe: sanitizeText(brief.vibe, 500),
  };
  const sanitizedSummary = sanitizeText(planSummary, 1500);

  if (!rateCheck.allowed) {
    // Graceful fallback on rate limit
    const fallbackAnswer = buildFallbackAssist(
      sanitizedQuestion,
      sanitizedBrief,
      sanitizedSummary,
      spentTotalInr
    );
    return NextResponse.json(fallbackAnswer, { status: 200 });
  }

  try {
    const prompt = buildAssistPrompt(
      sanitizedQuestion,
      sanitizedBrief,
      sanitizedSummary,
      spentTotalInr
    );
    const assistData = await callGeminiStructured(prompt, AssistResponseSchema);
    return NextResponse.json(assistData, { status: 200 });
  } catch (err: unknown) {
    console.warn('AI assist unavailable or invalid, falling back to deterministic planning logic:', err);
    const fallbackAnswer = buildFallbackAssist(
      sanitizedQuestion,
      sanitizedBrief,
      sanitizedSummary,
      spentTotalInr
    );
    return NextResponse.json(fallbackAnswer, { status: 200 });
  }
}

