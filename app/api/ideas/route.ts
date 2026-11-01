import { NextRequest, NextResponse } from 'next/server';
import { IdeasRequestSchema } from '@/schemas/api';
import { IdeasResponseSchema } from '@/schemas/plan';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/sanitize';
import { buildIdeasPrompt } from '@/lib/ai/prompts';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildFallbackIdeas } from '@/lib/fallbackPlan';

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

  const parsed = IdeasRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Invalid request body';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { brief, tweak, userId } = parsed.data;

  // Rate limiting (generous in development)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimitKey = `ideas:${userId}:${ip}`;
  const rateCheck = checkRateLimit(rateLimitKey);

  // Sanitize free text
  const sanitizedBrief = {
    ...brief,
    title: sanitizeText(brief.title, 80),
    city: sanitizeText(brief.city, 60),
    vibe: sanitizeText(brief.vibe, 500),
  };
  const sanitizedTweak = sanitizeText(tweak, 200);

  if (!rateCheck.allowed) {
    // Graceful fallback on rate limit
    const fallbackIdeas = buildFallbackIdeas(sanitizedBrief, sanitizedTweak);
    return NextResponse.json(fallbackIdeas, { status: 200 });
  }

  try {
    const prompt = buildIdeasPrompt(sanitizedBrief, sanitizedTweak);
    const ideasData = await callGeminiStructured(prompt, IdeasResponseSchema);
    return NextResponse.json(ideasData, { status: 200 });
  } catch (err: unknown) {
    console.warn('AI ideas generation unavailable or invalid, falling back to deterministic template:', err);
    const fallbackIdeas = buildFallbackIdeas(sanitizedBrief, sanitizedTweak);
    return NextResponse.json(fallbackIdeas, { status: 200 });
  }
}

