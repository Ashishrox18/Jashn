'use client';

import React, { useState, useMemo } from 'react';
import { EventRecord } from '@/types';
import {
  SchedulingResult,
  groupByMonth,
  isOverdue,
  ScheduledTask,
} from '@/lib/engines/timeline';
import { buildIcs } from '@/lib/engines/ics';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { useToast } from '@/components/ui/Toast';
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';

export interface TimelineTabProps {
  event: EventRecord;
  scheduling: SchedulingResult;
  today: string;
  onToggleTask: (taskId: string) => void;
}

type FilterOption = 'all' | 'overdue' | 'this_month' | 'high_priority';

export function TimelineTab({
  event,
  scheduling,
  today,
  onToggleTask,
}: TimelineTabProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const { showToast } = useToast();

  const currentYearMonth = today.slice(0, 7); // "YYYY-MM"

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return scheduling.scheduled.filter((task) => {
      const overdue = isOverdue(task, today, event.state.completedTaskIds);
      const isThisMonth = task.dueDate.startsWith(currentYearMonth);

      if (filter === 'overdue') return overdue;
      if (filter === 'this_month') return isThisMonth;
      if (filter === 'high_priority') return task.priority === 'high';
      return true;
    });
  }, [scheduling.scheduled, filter, today, event.state.completedTaskIds, currentYearMonth]);

  // Group filtered tasks by month
  const grouped = useMemo(() => {
    return groupByMonth(filteredTasks);
  }, [filteredTasks]);

  // Export .ics calendar file
  const handleExportIcs = () => {
    try {
      const icsString = buildIcs(
        event.brief.title,
        scheduling.scheduled,
        event.brief.eventDate
      );
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.brief.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_schedule.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Calendar (.ics) downloaded! Ready to import into Google/Apple calendar.', 'success');
    } catch {
      showToast('Failed to export calendar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Calendar Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Task filters">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all' as FilterOption, label: 'All Tasks' },
            { id: 'overdue' as FilterOption, label: 'Overdue' },
            { id: 'this_month' as FilterOption, label: 'This Month' },
            { id: 'high_priority' as FilterOption, label: 'High Priority' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                filter === item.id
                  ? 'bg-primary text-primary-ink shadow-sm'
                  : 'bg-surface-2 text-ink-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Calendar Export CTA */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportIcs}
          className="border-primary text-primary hover:bg-primary/5"
        >
          <CalendarPlus className="w-4 h-4 mr-1.5 text-accent" aria-hidden="true" />
          <span>Add to Calendar (.ics)</span>
        </Button>
      </div>

      {/* Task List Grouped by Month */}
      {Object.keys(grouped).length === 0 ? (
        <Card className="p-8 text-center text-ink-muted">
          <CheckCircle2 className="w-10 h-10 text-ok mx-auto mb-2" />
          <p className="text-base font-bold text-ink">No tasks match this filter</p>
          <p className="text-xs mt-1">Switch filter back to &ldquo;All Tasks&rdquo; to see the entire roadmap.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([monthLabel, tasks]) => (
            <div key={monthLabel} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" aria-hidden="true" />
                <h3 className="text-lg font-heading font-bold text-ink">
                  {monthLabel}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => {
                  const isCompleted = event.state.completedTaskIds.includes(task.id);
                  const overdue = isOverdue(task, today, event.state.completedTaskIds);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isCompleted
                          ? 'bg-surface-2/40 border-border opacity-75'
                          : overdue
                          ? 'bg-danger-soft/20 border-danger/30'
                          : 'bg-surface border-border hover:border-primary/40'
                      }`}
                    >
                      {/* Accessible Checkbox */}
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggleTask(task.id)}
                        id={`task-${task.id}`}
                        aria-label={`Mark task ${task.title} as completed`}
                        className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-accent cursor-pointer min-h-[24px] min-w-[24px]"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label
                            htmlFor={`task-${task.id}`}
                            className={`font-bold text-base cursor-pointer ${
                              isCompleted ? 'line-through text-ink-muted' : 'text-ink'
                            }`}
                          >
                            {task.title}
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink-muted">
                              {task.category}
                            </span>
                            <StatusPill type="priority" status={task.priority} />
                          </div>
                        </div>

                        <p className="text-xs md:text-sm text-ink-muted mt-1 leading-relaxed">
                          {task.details}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs">
                          <span className="text-ink font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-accent" />
                            <span>Target: {formatDate(task.dueDate)}</span>
                          </span>

                          {overdue && (
                            <span className="text-danger font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Overdue</span>
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-ok font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
