'use client';

import React, { useState } from 'react';
import { EventRecord, AssistResponse } from '@/types';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import {
  Sparkles,
  Send,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Bot,
} from 'lucide-react';

export interface AssistPanelProps {
  event: EventRecord;
  totalSpent: number;
}

const defaultStarterQuestions = [
  'What should be our top priority to lock down this week?',
  'How can we optimize decor & catering without losing celebration charm?',
  'What civic or noise permissions should we be mindful of in this city?',
  'What key questions should we ask photographers before paying advance?',
];

/**
 * Formats structured text containing bold marks, numbered lists, or bullet points.
 */
function FormattedAnswer({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-2.5 text-sm text-ink leading-relaxed">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');

        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Bullet points
              const isBullet = /^[•\-\*]\s+/.test(trimmed);
              // Numbered list
              const isNumbered = /^\d+[\.\)]\s+/.test(trimmed);

              const content = trimmed.replace(/^[•\-\*]\s+/, '').replace(/^\d+[\.\)]\s+/, '');

              // Parse bold **text**
              const parts = content.split(/(\*\*[^*]+\*\*)/g);

              const renderedParts = parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={partIdx} className="font-bold text-ink">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              });

              if (isBullet || isNumbered) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2 my-1">
                    <span className="text-primary font-bold select-none shrink-0 mt-0.5">
                      {isNumbered ? trimmed.match(/^\d+[\.\)]/)?.[0] : '•'}
                    </span>
                    <span className="text-sm leading-normal">{renderedParts}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderedParts}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AssistPanel({ event, totalSpent }: AssistPanelProps) {
  const { askJashn, isAsking, error } = useAI();
  const [question, setQuestion] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<
    { question: string; response: AssistResponse; timestamp: string }[]
  >([]);

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || queryText.trim().length < 3) return;

    const res = await askJashn(
      queryText.trim(),
      event.brief,
      event.plan.summary,
      totalSpent
    );

    if (res) {
      setHistory((prev) => [
        {
          question: queryText.trim(),
          response: res,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setQuestion('');
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Card className="p-5 md:p-6 space-y-5 border-2 border-primary/20 bg-primary/5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-ink flex items-center justify-center font-bold shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-ink flex items-center gap-2">
              <span>Ask Jashn</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                Assistant
              </span>
            </h3>
            <p className="text-xs text-ink-muted">
              Instant practical planning answers tailored to your event context and budget.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setHistory([])}
            className="text-xs text-ink-muted hover:text-ink min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Clear Thread</span>
          </Button>
        )}
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
            placeholder="Ask anything about timelines, cost-saving, local vendors, permissions…"
            disabled={isAsking}
            aria-label="Ask Jashn an event planning question"
            className="w-full px-4 py-3 pr-24 rounded-xl border border-border bg-surface text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px] shadow-sm"
          />
          <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isAsking}
              disabled={isAsking || question.trim().length < 3}
              className="h-full px-3 text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>Ask</span>
            </Button>
          </div>
        </div>

        {/* Suggestion Starter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-muted mr-1">Suggested:</span>
          {defaultStarterQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(q)}
              disabled={isAsking}
              className="text-xs px-2.5 py-1 rounded-md bg-surface text-ink border border-border hover:bg-surface-2 hover:border-primary/40 transition-colors text-left min-h-[32px]"
            >
              &ldquo;{q}&rdquo;
            </button>
          ))}
        </div>
      </form>

      {/* Loading Skeleton Indicator */}
      {isAsking && (
        <div className="p-4 rounded-xl bg-surface border border-accent/30 space-y-3 animate-pulse shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Consulting Jashn planner for {event.brief.title} in {event.brief.city}…</span>
          </div>
          <div className="h-3.5 bg-surface-2 rounded w-5/6" />
          <div className="h-3.5 bg-surface-2 rounded w-4/6" />
          <div className="h-3.5 bg-surface-2 rounded w-3/6" />
        </div>
      )}

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
            className="p-5 rounded-xl bg-surface border border-border space-y-3.5 shadow-sm"
          >
            {/* User Question */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent px-2 py-0.5 rounded bg-accent-soft shrink-0 mt-0.5">
                  You Asked
                </span>
                <p className="text-sm font-bold text-ink">{item.question}</p>
              </div>
              <span className="text-[10px] text-ink-muted shrink-0">{item.timestamp}</span>
            </div>

            {/* Jashn Answer */}
            <div className="pt-3 border-t border-border/70 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Jashn Guidance
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item.response.answer, idx)}
                  className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink px-2 py-0.5 rounded border border-border/60 hover:bg-surface-2 transition-colors"
                  aria-label="Copy guidance"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-ok" />
                      <span className="text-ok font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Formatted Content */}
              <FormattedAnswer text={item.response.answer} />
            </div>

            {/* Caveat */}
            {item.response.caveat && (
              <div className="p-3 rounded-lg bg-surface-2 text-xs text-ink-muted border border-border/60 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{item.response.caveat}</span>
              </div>
            )}

            {/* Follow-up question chips */}
            {item.response.followUps && item.response.followUps.length > 0 && (
              <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-muted font-medium">Follow-up:</span>
                {item.response.followUps.map((fu, fIdx) => (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => handleAsk(fu)}
                    disabled={isAsking}
                    className="text-xs px-2.5 py-1 rounded-full bg-surface-2 text-ink hover:bg-border transition-colors flex items-center gap-1 min-h-[32px] border border-border/60"
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
