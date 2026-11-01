/**
 * @jest-environment node
 */
import { POST as planRoute } from '@/app/api/plan/route';
import { POST as ideasRoute } from '@/app/api/ideas/route';
import { POST as assistRoute } from '@/app/api/assist/route';
import { resetRateLimits } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';
import * as geminiModule from '@/lib/ai/gemini';

jest.mock('@/lib/ai/gemini', () => {
  const original = jest.requireActual('@/lib/ai/gemini');
  return {
    ...original,
    callGeminiStructured: jest.fn(),
  };
});

const mockCallGeminiStructured = geminiModule.callGeminiStructured as jest.Mock;

const validBrief = {
  eventType: 'wedding',
  title: 'Diya & Aarav Wedding',
  eventDate: '2027-02-14',
  city: 'Udaipur',
  guestCount: 250,
  totalBudgetInr: 3000000,
  vibe: 'Grand lake palace festivities',
  constraints: ['vegetarian_only'],
  weddingFunctions: ['sangeet', 'ceremony', 'reception'],
  honoreeAge: null,
  communityKind: null,
};

function createMockRequest(url: string, bodyText: string, ip = '127.0.0.1'): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: bodyText,
  });
}

describe('API Route Handlers', () => {
  beforeEach(() => {
    resetRateLimits();
    jest.clearAllMocks();
  });

  describe('POST /api/plan', () => {
    it('returns 400 on malformed JSON', async () => {
      const req = createMockRequest('http://localhost:3000/api/plan', 'INVALID_JSON_///');
      const res = await planRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid JSON');
    });

    it('returns 400 on invalid body schema (missing title)', async () => {
      const invalid = { brief: { ...validBrief, title: '' }, userId: '550e8400-e29b-41d4-a716-446655440000' };
      const req = createMockRequest('http://localhost:3000/api/plan', JSON.stringify(invalid));
      const res = await planRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('returns 200 on successful AI plan generation', async () => {
      mockCallGeminiStructured.mockResolvedValueOnce({
        summary: 'A curated wedding plan',
        budget: [],
        timeline: [],
        vendors: [],
        ideas: [],
        risks: [],
        confidence: 0.9,
      });

      const validPayload = { brief: validBrief, userId: '550e8400-e29b-41d4-a716-446655440000' };
      const req = createMockRequest('http://localhost:3000/api/plan', JSON.stringify(validPayload));
      const res = await planRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary).toBe('A curated wedding plan');
    });

    it('returns 503 when NO_KEY is thrown', async () => {
      mockCallGeminiStructured.mockRejectedValueOnce(new geminiModule.AiError('NO_KEY'));
      const validPayload = { brief: validBrief, userId: '550e8400-e29b-41d4-a716-446655440000' };
      const req = createMockRequest('http://localhost:3000/api/plan', JSON.stringify(validPayload));
      const res = await planRoute(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.code).toBe('NO_KEY');
    });

    it('returns 422 when BAD_OUTPUT is thrown', async () => {
      mockCallGeminiStructured.mockRejectedValueOnce(new geminiModule.AiError('BAD_OUTPUT'));
      const validPayload = { brief: validBrief, userId: '550e8400-e29b-41d4-a716-446655440000' };
      const req = createMockRequest('http://localhost:3000/api/plan', JSON.stringify(validPayload));
      const res = await planRoute(req);
      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.code).toBe('BAD_OUTPUT');
    });

    it('enforces rate limiting on 11th request with 429 and Retry-After', async () => {
      mockCallGeminiStructured.mockResolvedValue({ summary: 'ok' });
      const validPayload = { brief: validBrief, userId: '550e8400-e29b-41d4-a716-446655440000' };

      for (let i = 0; i < 10; i++) {
        const req = createMockRequest('http://localhost:3000/api/plan', JSON.stringify(validPayload));
        const res = await planRoute(req);
        expect(res.status).toBe(200);
      }

      // 11th call
      const req11 = createMockRequest('http://localhost:3000/api/plan', JSON.stringify(validPayload));
      const res11 = await planRoute(req11);
      expect(res11.status).toBe(429);
      expect(res11.headers.get('Retry-After')).toBeDefined();
    });
  });

  describe('POST /api/ideas', () => {
    it('returns 200 with refreshed ideas', async () => {
      mockCallGeminiStructured.mockResolvedValueOnce({
        ideas: [{ type: 'theme', title: 'Palace lights', description: 'desc', estCostInr: 50000 }],
        note: 'Tuned for traditional elegance',
      });

      const payload = {
        brief: validBrief,
        tweak: 'more heritage focused',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      };
      const req = createMockRequest('http://localhost:3000/api/ideas', JSON.stringify(payload));
      const res = await ideasRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ideas.length).toBe(1);
    });
  });

  describe('POST /api/assist', () => {
    it('returns 200 with concise planning answer', async () => {
      mockCallGeminiStructured.mockResolvedValueOnce({
        answer: 'For a lake palace venue, book at least 6 months ahead and verify sound permissions.',
        followUps: ['What are standard power backup requirements?'],
        caveat: 'Confirm with Udaipur municipal office for sound curfew.',
      });

      const payload = {
        question: 'When should we finalize venue permissions?',
        brief: validBrief,
        planSummary: 'Wedding in Udaipur',
        spentTotalInr: 500000,
        userId: '550e8400-e29b-41d4-a716-446655440002',
      };
      const req = createMockRequest('http://localhost:3000/api/assist', JSON.stringify(payload));
      const res = await assistRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.answer).toContain('lake palace');
      expect(data.followUps.length).toBe(1);
    });
  });
});
