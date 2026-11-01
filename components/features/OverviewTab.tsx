'use client';

import React from 'react';
import { EventRecord, Category } from '@/types';
import { BudgetSummary } from '@/lib/engines/budget';
import { SchedulingResult, isOverdue } from '@/lib/engines/timeline';
import { formatInr, formatDate } from '@/lib/format';
import { CountdownRing } from '@/components/ui/CountdownRing';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Notice } from '@/components/ui/Notice';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  MapPin,
  Users,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const DONUT_COLORS = [
  '#7A1F4B', // plum
  '#B45309', // marigold
  '#166534', // forest green
  '#D97706', // amber
  '#4338CA', // indigo
  '#BE185D', // rose
  '#0284C7', // sky
  '#059669', // emerald
  '#7C3AED', // violet
  '#64748B', // slate
];

export interface OverviewTabProps {
  event: EventRecord;
  allocations: Record<Category, number>;
  budgetSummary: BudgetSummary;
  scheduling: SchedulingResult;
  daysToGo: number;
  currentPhase: string;
  today: string;
  onNavigateToTab: (tabId: string) => void;
  onToggleTask: (taskId: string) => void;
}

export function OverviewTab({
  event,
  allocations,
  budgetSummary,
  scheduling,
  daysToGo,
  currentPhase,
  today,
  onNavigateToTab,
  onToggleTask,
}: OverviewTabProps) {
  const totalTasks = event.plan.timeline.length;
  const completedCount = event.state.completedTaskIds.length;
  const taskPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Next 3 tasks
  const pendingTasks = scheduling.scheduled.filter(
    (t) => !event.state.completedTaskIds.includes(t.id)
  );
  const next3 = pendingTasks.slice(0, 3);

  // Prepare chart data
  const chartData = event.plan.budget.map((line) => ({
    name: line.category.charAt(0).toUpperCase() + line.category.slice(1),
    category: line.category,
    value: allocations[line.category] ?? 0,
    percent: line.percent,
  }));

  return (
    <div className="space-y-6">
      {/* Fallback Notice */}
      {event.source === 'fallback' && (
        <Notice type="warn" title="Standard Template Plan Active">
          AI was temporarily unavailable during generation — showing a standard Indian celebration blueprint. All mathematical budgets and timeline schedules are fully functional and customizable.
        </Notice>
      )}

      {/* Compressed Timeline Notice */}
      {scheduling.compressed && (
        <Notice type="info" title="Accelerated Timeline">
          Your event is sooner than a standard planning cycle — Jashn proportionally compressed the milestone timeline so all critical bookings fit between today and event day.
        </Notice>
      )}

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Countdown Ring Card */}
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-surface">
          <CountdownRing days={daysToGo} phaseName={currentPhase} />
          <div className="mt-4 text-xs text-ink-muted flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>{formatDate(event.brief.eventDate)}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{event.brief.city}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span>{event.brief.guestCount} Guests</span>
            </span>
          </div>
        </Card>

        {/* AI Summary & High-Level Progress */}
        <Card className="lg:col-span-2 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-xl font-heading font-bold text-ink">Celebration Vision</h2>
              <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                {event.brief.eventType}
              </span>
            </div>
            <p className="text-ink text-sm md:text-base leading-relaxed mb-4">
              {event.plan.summary}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <ProgressBar
              value={budgetSummary.percentUsed}
              label="Budget Utilization"
              helperText={`${formatInr(budgetSummary.totalSpent)} spent of ${formatInr(
                budgetSummary.totalAllocated
              )}`}
              variant={
                budgetSummary.percentUsed > 100
                  ? 'danger'
                  : budgetSummary.percentUsed >= 90
                  ? 'warn'
                  : 'ok'
              }
            />

            <ProgressBar
              value={taskPercent}
              label="Timeline Milestones"
              helperText={`${completedCount} of ${totalTasks} tasks completed`}
              variant="primary"
            />
          </div>
        </Card>
      </div>

      {/* Middle Section: Budget Donut + Next Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Donut with Accessible Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-heading font-bold text-ink">Budget Allocation</h2>
              <p className="text-xs text-ink-muted">Estimates only — confirm with local vendor quotes</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('budget')}
              className="text-xs font-semibold text-primary hover:underline min-h-[44px] flex items-center"
            >
              Open Budget Table →
            </button>
          </div>

          {/* Donut Chart with role="img" */}
          <div
            role="img"
            aria-label={`Donut chart showing budget allocation across ${event.plan.budget.length} categories summing to ${formatInr(budgetSummary.totalAllocated)}`}
            className="w-full h-56 relative flex items-center justify-center"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatInr(val), 'Allocated']}
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    color: 'var(--ink)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Accessible Table Alternative */}
          <div className="mt-4 border-t border-border pt-3">
            <h3 className="text-xs uppercase font-bold text-ink-muted tracking-wider mb-2">
              Allocation Breakdown
            </h3>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-ink-muted">
                    <th scope="col" className="py-1">Category</th>
                    <th scope="col" className="py-1">Share</th>
                    <th scope="col" className="py-1 text-right">Allocated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {chartData.map((d, i) => (
                    <tr key={d.category} className="hover:bg-surface-2/50">
                      <td className="py-1 flex items-center gap-1.5 font-medium text-ink">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                          aria-hidden="true"
                        />
                        <span>{d.name}</span>
                      </td>
                      <td className="py-1 text-ink-muted">{d.percent}%</td>
                      <td className="py-1 text-right font-semibold text-ink">
                        {formatInr(d.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Next 3 Milestones & Overdue Alerts */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-heading font-bold text-ink">Next Milestones</h2>
                <p className="text-xs text-ink-muted">Immediate action items from your dated timeline</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('timeline')}
                className="text-xs font-semibold text-primary hover:underline min-h-[44px] flex items-center"
              >
                View All Tasks →
              </button>
            </div>

            {next3.length === 0 ? (
              <div className="text-center py-8 text-ink-muted">
                <CheckCircle2 className="w-8 h-8 mx-auto text-ok mb-2" />
                <p className="text-sm font-semibold text-ink">All tasks completed!</p>
                <p className="text-xs">Your celebration roadmap is 100% finished.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {next3.map((task) => {
                  const overdue = isOverdue(task, today, event.state.completedTaskIds);
                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-lg border border-border bg-surface-2/40 flex items-start gap-3 transition-colors hover:bg-surface-2"
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => onToggleTask(task.id)}
                        id={`overview-task-${task.id}`}
                        aria-label={`Mark task ${task.title} as completed`}
                        className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-accent cursor-pointer min-h-[24px] min-w-[24px]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={`overview-task-${task.id}`}
                            className="font-bold text-sm text-ink truncate cursor-pointer"
                          >
                            {task.title}
                          </label>
                          <StatusPill type="priority" status={task.priority} />
                        </div>
                        <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                          {task.details}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="text-ink-muted">Due: {formatDate(task.dueDate)}</span>
                          {overdue && (
                            <span className="text-danger font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overdue Summary Alert if any */}
          {scheduling.scheduled.some((t) => isOverdue(t, today, event.state.completedTaskIds)) && (
            <div className="mt-4 p-3 rounded-lg bg-danger-soft text-danger border border-danger/30 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                You have overdue tasks. Check the Timeline tab to reschedule or tick them off.
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section: Top Risks & Mitigations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-warn" aria-hidden="true" />
          <h2 className="text-xl font-heading font-bold text-ink">
            Anticipated Risks & Practical Mitigations
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {event.plan.risks.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-surface-2/30 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-warn">
                  Risk #{i + 1}
                </span>
                <p className="text-sm font-semibold text-ink mt-1 mb-2">
                  {r.risk}
                </p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-ok">
                  Mitigation
                </span>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  {r.mitigation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
