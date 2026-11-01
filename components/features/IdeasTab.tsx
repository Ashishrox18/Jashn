'use client';

import React, { useState } from 'react';
import { EventRecord, Idea, IdeaType } from '@/types';
import { formatInr } from '@/lib/format';
import { useAI } from '@/hooks/useAI';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { AssistPanel } from './AssistPanel';
import {
  Sparkles,
  Palette,
  UtensilsCrossed,
  PartyPopper,
  Flower2,
  Gift,
  Music,
  RotateCw,
} from 'lucide-react';

export interface IdeasTabProps {
  event: EventRecord;
  totalSpent: number;
}

const ideaTypeIcons: Record<IdeaType, React.ElementType> = {
  theme: Palette,
  menu: UtensilsCrossed,
  activity: PartyPopper,
  decor: Flower2,
  gift: Gift,
  entertainment: Music,
};

const quickTweaks = [
  'More traditional & regional heritage',
  'Eco-friendly & zero plastic waste',
  'Budget-friendly options under ₹50k',
  'High-energy interactive entertainment',
];

export function IdeasTab({ event, totalSpent }: IdeasTabProps) {
  const { refreshIdeas, isRefreshingIdeas, error } = useAI();
  const [ideas, setIdeas] = useState<Idea[]>(event.plan.ideas);
  const [tweakInput, setTweakInput] = useState('');
  const [refreshNote, setRefreshNote] = useState<string | null>(null);

  const handleRefresh = async (tweakText: string) => {
    const res = await refreshIdeas(event.brief, tweakText);
    if (res) {
      setIdeas(res.ideas);
      setRefreshNote(res.note);
      setTweakInput('');
    }
  };

  // Group ideas by type
  const groupedIdeas = ideas.reduce((acc, idea) => {
    if (!acc[idea.type]) {
      acc[idea.type] = [];
    }
    acc[idea.type]!.push(idea);
    return acc;
  }, {} as Record<IdeaType, Idea[]>);

  return (
    <div className="space-y-8">
      {/* Refresh Ideas Control Card */}
      <Card className="p-5 md:p-6 bg-surface border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-heading font-bold text-ink">
            Personalized Creative Ideas & Suggestions
          </h2>
        </div>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          Tweak suggestions to align with your evolving vision or specific budget adjustments.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRefresh(tweakInput);
          }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={tweakInput}
              onChange={(e) => setTweakInput(e.target.value)}
              placeholder="e.g. Focus on live sufi music, traditional jalebi counters, minimalist floral mandap…"
              disabled={isRefreshingIdeas}
              aria-label="Tweak instructions for ideas"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isRefreshingIdeas}
              disabled={isRefreshingIdeas}
            >
              <RotateCw className="w-4 h-4 mr-1.5" />
              <span>Refresh Ideas</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <span className="font-semibold">Quick adjustments:</span>
            {quickTweaks.map((tweak, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleRefresh(tweak)}
                disabled={isRefreshingIdeas}
                className="px-2.5 py-1 rounded bg-surface-2 text-ink hover:bg-border transition-colors min-h-[36px]"
              >
                &ldquo;{tweak}&rdquo;
              </button>
            ))}
          </div>
        </form>

        {refreshNote && (
          <div className="mt-4 p-3 rounded-lg bg-accent-soft/30 border border-accent/20 text-xs text-ink font-medium">
            <strong>Update Note:</strong> {refreshNote}
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Notice type="error">{error}</Notice>
          </div>
        )}
      </Card>

      {/* Ideas Grouped Grid */}
      <div className="space-y-6">
        {(Object.keys(groupedIdeas) as IdeaType[]).map((type) => {
          const Icon = ideaTypeIcons[type] || Sparkles;
          const items = groupedIdeas[type] || [];

          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
                <h3 className="text-lg font-heading font-bold text-ink uppercase tracking-wide">
                  {type} Inspiration
                </h3>
                <span className="text-xs text-ink-muted">({items.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((idea, idx) => (
                  <Card
                    key={idx}
                    className="p-5 flex flex-col justify-between hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-base font-heading text-ink">
                          {idea.title}
                        </h4>
                      </div>
                      <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                        {idea.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Estimated Cost:</span>
                      <span className="font-bold text-primary">
                        {idea.estCostInr !== null && idea.estCostInr > 0
                          ? `≈ ${formatInr(idea.estCostInr)}`
                          : 'Included in Base / Minimal'}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrated Ask Jashn Assistant */}
      <div className="pt-4">
        <AssistPanel event={event} totalSpent={totalSpent} />
      </div>
    </div>
  );
}

