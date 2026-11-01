'use client';

import React, { useState } from 'react';
import { EventRecord, AssistResponse } from '@/types';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import {
  MessageSquare,
  Sparkles,
  Send,
  HelpCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export interface AssistPanelProps {
  event: EventRecord;
  totalSpent: number;
}

const defaultStarterQuestions = [
  'What should be our top priority to lock down this week?',
  'How can we optimize decor & catering without losing celebration charm?',
  'What civic or noise permissions should we be mindful of in this city?',
];

export function AssistPanel({ event, totalSpent }: AssistPanelProps) {
  const { askJashn, isAsking, error } = useAI();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<
    { question: string; response: AssistResponse }[]
  >([]);

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || queryText.trim().length < 5) return;

    const res = await askJashn(
      queryText.trim(),
      event.brief,
      event.plan.summary,
      totalSpent
    );

    if (res) {
      setHistory((prev) => [
        { question: queryText.trim(), response: res },
        ...prev,
      ]);
      setQuestion('');
    }
  };

  return (
    <Card className="p-5 md:p-6 space-y-5 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-ink flex items-center justify-center font-bold">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-bold text-ink">Ask Jashn</h3>
          <p className="text-xs text-ink-muted">
            Instant practical planning answers tailored to your event context and budget.
          </p>
        </div>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about your celebration timeline, budgeting, or vendor questions…"
            disabled={isAsking}
            aria-label="Ask Jashn an event planning question"
            className="w-full px-4 py-3 pr-24 rounded-xl border border-border bg-surface text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
          />
          <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isAsking}
              disabled={isAsking || question.trim().length < 5}
              className="h-full px-3 text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>Ask</span>
            </Button>
          </div>
        </div>

        {/* Starter suggestion chips */}
        {history.length === 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-muted mr-1">Starters:</span>
            {defaultStarterQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(q)}
                disabled={isAsking}
                className="text-xs px-2.5 py-1 rounded-md bg-surface text-ink border border-border hover:bg-surface-2 transition-colors text-left min-h-[36px]"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        )}
      </form>

      {error && (
        <Notice type="error" title="Assistant Notice">
          {error}
        </Notice>
      )}

      {/* Answer thread */}
      <div className="space-y-4">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-surface border border-border space-y-3 shadow-sm"
          >
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent px-2 py-0.5 rounded bg-accent-soft shrink-0">
                You Asked
              </span>
              <p className="text-sm font-semibold text-ink">{item.question}</p>
            </div>

            <div className="pt-2 border-t border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                Jashn Guidance
              </span>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {item.response.answer}
              </p>
            </div>

            {/* Caveat */}
            {item.response.caveat && (
              <div className="p-2.5 rounded-lg bg-surface-2 text-xs text-ink-muted border border-border/60 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{item.response.caveat}</span>
              </div>
            )}

            {/* Follow-up question chips */}
            {item.response.followUps.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-muted font-medium">Follow-up:</span>
                {item.response.followUps.map((fu, fIdx) => (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => handleAsk(fu)}
                    disabled={isAsking}
                    className="text-xs px-2.5 py-1 rounded-full bg-surface-2 text-ink hover:bg-border transition-colors flex items-center gap-1 min-h-[36px]"
                  >
                    <span>{fu}</span>
                    <ArrowRight className="w-3 h-3 text-accent" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
