'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { EventRecord, Category, VendorStatus, EventState } from '@/types';
import { getEvent, updateEventState, saveEvent } from '@/lib/storage';
import { allocate, rebalance, summarize, BudgetSummary } from '@/lib/engines/budget';
import { scheduleTasks, daysUntil, phase, SchedulingResult } from '@/lib/engines/timeline';
import { useToast } from '@/components/ui/Toast';

export function useEvent(id: string) {
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  const reload = useCallback(() => {
    const record = getEvent(id);
    setEvent(record);
    setIsLoaded(true);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Today in UTC YYYY-MM-DD
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Pure engine computations
  const allocations = useMemo(() => {
    if (!event) return {} as Record<Category, number>;
    return allocate(event.brief.totalBudgetInr, event.plan.budget);
  }, [event]);

  const budgetSummary: BudgetSummary = useMemo(() => {
    if (!event) {
      return { totalAllocated: 0, totalSpent: 0, remaining: 0, percentUsed: 0, overCategories: [] };
    }
    return summarize(allocations, event.state.spentByCategory);
  }, [event, allocations]);

  const scheduling: SchedulingResult = useMemo(() => {
    if (!event) return { scheduled: [], compressed: false };
    return scheduleTasks(event.plan.timeline, event.brief.eventDate, today);
  }, [event, today]);

  const daysToGo = useMemo(() => {
    if (!event) return 0;
    return daysUntil(event.brief.eventDate, today);
  }, [event, today]);

  const currentPhase = useMemo(() => {
    return phase(daysToGo);
  }, [daysToGo]);

  // State mutators
  const updateSpend = useCallback(
    (category: Category, amount: number) => {
      const validAmount = Math.max(0, Math.round(amount));
      const res = updateEventState(id, (prev) => ({
        ...prev,
        spentByCategory: {
          ...prev.spentByCategory,
          [category]: validAmount,
        },
      }));

      if (res.success) {
        reload();
      } else {
        showToast(res.error || 'Failed to update spent amount', 'error');
      }
    },
    [id, reload, showToast]
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      const res = updateEventState(id, (prev) => {
        const completed = prev.completedTaskIds.includes(taskId)
          ? prev.completedTaskIds.filter((t) => t !== taskId)
          : [...prev.completedTaskIds, taskId];
        return {
          ...prev,
          completedTaskIds: completed,
        };
      });

      if (res.success) {
        reload();
      }
    },
    [id, reload]
  );

  const setVendorCategoryStatus = useCallback(
    (category: Category, status: VendorStatus) => {
      const res = updateEventState(id, (prev) => ({
        ...prev,
        vendorStatus: {
          ...prev.vendorStatus,
          [category]: status,
        },
      }));

      if (res.success) {
        reload();
        showToast(`Vendor status updated to ${status}`, 'success');
      }
    },
    [id, reload, showToast]
  );

  const applyBudgetRebalance = useCallback(
    (fromCat: Category, toCat: Category, amount: number) => {
      if (!event) return;
      const updatedAllocations = rebalance(allocations, fromCat, toCat, amount);

      // Map new allocations back to budget percentages
      const total = event.brief.totalBudgetInr;
      const updatedBudget = event.plan.budget.map((line) => {
        const newAmt = updatedAllocations[line.category] ?? 0;
        const newPercent = Number(((newAmt / total) * 100).toFixed(1));
        return {
          ...line,
          percent: newPercent,
        };
      });

      const updatedRecord: EventRecord = {
        ...event,
        plan: {
          ...event.plan,
          budget: updatedBudget,
        },
      };

      const res = saveEvent(updatedRecord);
      if (res.success) {
        reload();
        showToast('Budget successfully rebalanced!', 'success');
      } else {
        showToast(res.error || 'Failed to rebalance budget', 'error');
      }
    },
    [event, allocations, reload, showToast]
  );

  return {
    event,
    isLoaded,
    today,
    allocations,
    budgetSummary,
    scheduling,
    daysToGo,
    currentPhase,
    updateSpend,
    toggleTask,
    setVendorCategoryStatus,
    applyBudgetRebalance,
    reload,
  };
}

