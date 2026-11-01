'use client';

import React, { useState } from 'react';
import { EventRecord, Category } from '@/types';
import {
  lineStatus,
  BudgetSummary,
  rebalance,
} from '@/lib/engines/budget';
import { formatInr } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Lightbulb,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export interface BudgetTabProps {
  event: EventRecord;
  allocations: Record<Category, number>;
  budgetSummary: BudgetSummary;
  onUpdateSpend: (cat: Category, amt: number) => void;
  onApplyRebalance: (fromCat: Category, toCat: Category, amt: number) => void;
}

export function BudgetTab({
  event,
  allocations,
  budgetSummary,
  onUpdateSpend,
  onApplyRebalance,
}: BudgetTabProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set());

  // What-if simulator state
  const [showWhatIf, setShowWhatIf] = useState(false);
  const categoriesList = event.plan.budget.map((b) => b.category);
  const [fromCategory, setFromCategory] = useState<Category>(categoriesList[0] || 'venue');
  const [toCategory, setToCategory] = useState<Category>(
    categoriesList[1] || 'catering'
  );
  const [transferAmount, setTransferAmount] = useState<number>(25000);

  const toggleCategoryExpand = (cat: Category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Preview rebalance
  const simulatedAllocations = showWhatIf
    ? rebalance(allocations, fromCategory, toCategory, transferAmount)
    : allocations;

  const maxTransferable = allocations[fromCategory] ?? 0;

  const handleApplyRebalance = () => {
    if (transferAmount <= 0) return;
    onApplyRebalance(fromCategory, toCategory, transferAmount);
    setTransferAmount(10000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-xl font-heading font-bold text-ink">Budget Planner & Spend Tracker</h2>
          <p className="text-xs text-ink-muted">
            Estimates only — confirm with local vendor quotes
          </p>
        </div>

        <Button
          type="button"
          variant={showWhatIf ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowWhatIf(!showWhatIf)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" aria-hidden="true" />
          <span>{showWhatIf ? 'Close What-If Simulator' : 'What-If Rebalancer'}</span>
        </Button>
      </div>

      {/* What-If Rebalancing Panel */}
      {showWhatIf && (
        <Card className="p-5 border-2 border-accent/40 bg-accent-soft/10">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-5 h-5 text-accent" aria-hidden="true" />
            <h3 className="text-lg font-heading font-bold text-ink">
              What-If Budget Rebalancer (Live Pure Engine Preview)
            </h3>
          </div>
          <p className="text-xs text-ink-muted mb-4 leading-relaxed">
            Test reallocating funds between categories. Mathematical engines guarantee the exact total budget is strictly preserved and no category drops below ₹0.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
            <div>
              <label htmlFor="rebalance-from" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Move Money From
              </label>
              <select
                id="rebalance-from"
                value={fromCategory}
                onChange={(e) => setFromCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()} ({formatInr(allocations[c] ?? 0)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rebalance-to" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Move Money To
              </label>
              <select
                id="rebalance-to"
                value={toCategory}
                onChange={(e) => setToCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              >
                {categoriesList
                  .filter((c) => c !== fromCategory)
                  .map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()} ({formatInr(allocations[c] ?? 0)})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="rebalance-amount" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Amount to Transfer (Max {formatInr(maxTransferable)})
              </label>
              <input
                id="rebalance-amount"
                type="number"
                min={0}
                max={maxTransferable}
                step={5000}
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-lg bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink">Preview Outcome:</span>
              <span>
                {fromCategory}: {formatInr(allocations[fromCategory] ?? 0)} →{' '}
                <strong className="text-danger">
                  {formatInr(simulatedAllocations[fromCategory] ?? 0)}
                </strong>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
              <span>
                {toCategory}: {formatInr(allocations[toCategory] ?? 0)} →{' '}
                <strong className="text-ok">
                  {formatInr(simulatedAllocations[toCategory] ?? 0)}
                </strong>
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={transferAmount <= 0 || fromCategory === toCategory}
              onClick={handleApplyRebalance}
            >
              <Check className="w-4 h-4 mr-1" />
              <span>Apply Rebalance</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Main Budget Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Celebration budget allocation and spent tracker</caption>
            <thead className="bg-surface-2 text-ink uppercase tracking-wider text-xs font-bold border-b border-border">
              <tr>
                <th scope="col" className="p-4">Category</th>
                <th scope="col" className="p-4">Share %</th>
                <th scope="col" className="p-4 text-right">Allocated</th>
                <th scope="col" className="p-4 text-right">Spent (Editable)</th>
                <th scope="col" className="p-4 text-center">Status</th>
                <th scope="col" className="p-4 text-center">Tips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {event.plan.budget.map((line) => {
                const allocated = (showWhatIf ? simulatedAllocations : allocations)[line.category] ?? 0;
                const spent = event.state.spentByCategory[line.category] ?? 0;
                const status = lineStatus(allocated, spent);
                const isExpanded = expandedCategories.has(line.category);

                return (
                  <React.Fragment key={line.category}>
                    <tr className="hover:bg-surface-2/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-ink capitalize">
                          {line.category}
                        </div>
                        <div className="text-xs text-ink-muted line-clamp-1 max-w-xs">
                          {line.rationale}
                        </div>
                      </td>
                      <td className="p-4 text-ink-muted font-medium">
                        {line.percent}%
                      </td>
                      <td className="p-4 text-right font-bold text-ink">
                        {formatInr(allocated)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center justify-end">
                          <label htmlFor={`spent-${line.category}`} className="sr-only">
                            Spent amount for {line.category}
                          </label>
                          <input
                            id={`spent-${line.category}`}
                            type="number"
                            min={0}
                            step={500}
                            value={spent}
                            onChange={(e) => onUpdateSpend(line.category, Number(e.target.value))}
                            className="w-32 px-3 py-1.5 rounded-lg border border-border bg-surface text-right font-semibold text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <StatusPill type="budget" status={status} />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCategoryExpand(line.category)}
                          aria-expanded={isExpanded}
                          aria-label={`Toggle tips for ${line.category}`}
                          className="p-2 text-ink-muted hover:text-ink rounded hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Tips Row */}
                    {isExpanded && (
                      <tr className="bg-surface-2/20">
                        <td colSpan={6} className="p-4 text-xs">
                          <div className="flex items-start gap-2 text-accent mb-1 font-semibold">
                            <Lightbulb className="w-4 h-4" />
                            <span>Planning Advice & Tips for {line.category.toUpperCase()}:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-ink-muted pl-2">
                            {line.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Totals Row */}
            <tfoot className="bg-surface-2 font-bold text-ink border-t-2 border-border">
              <tr>
                <td className="p-4 uppercase tracking-wider text-xs">Total</td>
                <td className="p-4">100.0%</td>
                <td className="p-4 text-right">{formatInr(budgetSummary.totalAllocated)}</td>
                <td className="p-4 text-right text-primary">{formatInr(budgetSummary.totalSpent)}</td>
                <td className="p-4 text-center">
                  <span className="text-xs font-bold text-ink">
                    {budgetSummary.percentUsed}% used
                  </span>
                </td>
                <td className="p-4 text-center text-xs text-ink-muted">
                  Remaining: {formatInr(budgetSummary.remaining)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
