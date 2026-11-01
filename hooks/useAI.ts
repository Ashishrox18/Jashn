'use client';

import { useState, useCallback } from 'react';
import { Brief, PlanResponse, IdeasResponse, AssistResponse } from '@/types';
import { buildFallbackPlan } from '@/lib/fallbackPlan';
import { getUserId } from '@/lib/storage';

export function useAI() {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isRefreshingIdeas, setIsRefreshingIdeas] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates a complete event plan.
   * Calls /api/plan, and automatically falls back to buildFallbackPlan if AI fails or key is missing.
   */
  const generatePlan = useCallback(
    async (brief: Brief): Promise<{ plan: PlanResponse; source: 'ai' | 'fallback' }> => {
      setIsPlanning(true);
      setError(null);
      const userId = getUserId();

      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief, userId }),
        });

        if (!res.ok) {
          console.warn(`AI generation returned ${res.status}. Falling back to deterministic template.`);
          return {
            plan: buildFallbackPlan(brief),
            source: 'fallback',
          };
        }

        const data = (await res.json()) as PlanResponse;
        return {
          plan: data,
          source: 'ai',
        };
      } catch (err) {
        console.warn('Network or server error during AI call. Using deterministic fallback.', err);
        return {
          plan: buildFallbackPlan(brief),
          source: 'fallback',
        };
      } finally {
        setIsPlanning(false);
      }
    },
    []
  );

  /**
   * Refreshes ideas with user tweak.
   */
  const refreshIdeas = useCallback(
    async (brief: Brief, tweak: string): Promise<IdeasResponse | null> => {
      setIsRefreshingIdeas(true);
      setError(null);
      const userId = getUserId();

      try {
        const res = await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief, tweak, userId }),
        });

        if (!res.ok) {
          setError('Unable to refresh ideas at this moment. Showing original suggestions.');
          return null;
        }

        const data = (await res.json()) as IdeasResponse;
        return data;
      } catch {
        setError('Network error while refreshing ideas.');
        return null;
      } finally {
        setIsRefreshingIdeas(false);
      }
    },
    []
  );

  /**
   * Sends question to Ask Jashn assist endpoint.
   */
  const askJashn = useCallback(
    async (
      question: string,
      brief: Brief,
      planSummary: string,
      spentTotalInr: number
    ): Promise<AssistResponse | null> => {
      setIsAsking(true);
      setError(null);
      const userId = getUserId();

      try {
        const res = await fetch('/api/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            brief,
            planSummary,
            spentTotalInr,
            userId,
          }),
        });

        if (!res.ok) {
          setError('Assistant is currently unavailable. Please try again.');
          return null;
        }

        const data = (await res.json()) as AssistResponse;
        return data;
      } catch {
        setError('Network error while consulting assistant.');
        return null;
      } finally {
        setIsAsking(false);
      }
    },
    []
  );

  return {
    generatePlan,
    refreshIdeas,
    askJashn,
    isPlanning,
    isRefreshingIdeas,
    isAsking,
    error,
  };
}

