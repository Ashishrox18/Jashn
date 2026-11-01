'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import { formatInr, formatDate, formatRelativeDays } from '@/lib/format';
import { daysUntil } from '@/lib/engines/timeline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  CalendarHeart,
  Plus,
  Trash2,
  Download,
  Upload,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { events, isLoaded, removeEvent, exportBackup, importBackup } = useEvents();
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Esc key closes modal & focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteCandidateId) {
        setDeleteCandidateId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteCandidateId]);

  useEffect(() => {
    if (deleteCandidateId) {
      cancelBtnRef.current?.focus();
    }
  }, [deleteCandidateId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackup(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmDelete = () => {
    if (deleteCandidateId) {
      removeEvent(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-ink tracking-tight">
            My Celebrations
          </h1>
          <p className="text-ink-muted text-sm md:text-base mt-1">
            Organize budgets, dates, vendors, and ideas in one stress-free workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hidden File Input for Backup Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            aria-label="Upload backup JSON file"
            className="hidden"
            id="backup-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Import Jashn backup JSON file"
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>Import</span>
          </Button>

          {events.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportBackup}
              title="Download backup JSON file of all events"
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Export</span>
            </Button>
          )}

          <Link href="/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span>Plan a New Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Events Grid or Empty State */}
      {events.length === 0 ? (
        <EmptyState
          title="No celebrations planned yet"
          description="Create your first event brief to get an exact rupee budget, scheduled timeline, and curated vendor checklist in seconds."
          actionLabel="Plan your celebration"
          onAction={() => window.location.assign('/new')}
          icon={<CalendarHeart className="w-8 h-8" aria-hidden="true" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => {
            const daysToGo = daysUntil(event.brief.eventDate, todayStr);
            const totalTasks = event.plan.timeline.length;
            const completedTasks = event.state.completedTaskIds.length;
            const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const totalAllocated = event.brief.totalBudgetInr;
            const totalSpent = Object.values(event.state.spentByCategory).reduce((a, b) => a + b, 0);
            const budgetPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

            return (
              <Card
                key={event.id}
                className="relative flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                      {event.brief.eventType}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidateId(event.id)}
                      aria-label={`Delete event ${event.brief.title}`}
                      className="p-1.5 text-ink-muted hover:text-danger rounded-md hover:bg-danger-soft transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/event/${event.id}`}
                    className="block group-hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                  >
                    <h2 className="text-xl font-heading font-black text-ink mb-1 line-clamp-1">
                      {event.brief.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-ink-muted mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{formatDate(event.brief.eventDate)}</span>
                    </span>
                    <span>•</span>
                    <span className="font-medium text-accent">
                      {formatRelativeDays(daysToGo)}
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="space-y-3 py-3 border-t border-b border-border/70 my-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-ink-muted">Budget Used</span>
                        <span className="font-semibold text-ink">
                          {formatInr(totalSpent)} / {formatInr(totalAllocated)} ({budgetPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full ${
                            budgetPercent > 100
                              ? 'bg-danger'
                              : budgetPercent >= 90
                              ? 'bg-warn'
                              : 'bg-ok'
                          }`}
                          style={{ width: `${Math.min(100, budgetPercent)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-ink-muted">Tasks Completed</span>
                        <span className="font-semibold text-ink">
                          {completedTasks}/{totalTasks} ({taskPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${taskPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between">
                  <div className="text-xs text-ink-muted">
                    {event.source === 'fallback' ? (
                      <span className="text-accent font-medium">Standard Plan</span>
                    ) : (
                      <span className="text-primary font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Plan
                      </span>
                    )}
                  </div>
                  <Link href={`/event/${event.id}`}>
                    <Button variant="secondary" size="sm">
                      <span>Open Workspace</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (Accessible ARIA dialog, focus trap, Esc closes) */}
      {deleteCandidateId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
        >
          <div
            ref={modalRef}
            className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-danger">
              <div className="w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 id="delete-dialog-title" className="text-xl font-heading font-bold text-ink">
                Delete Celebration?
              </h3>
            </div>
            <p id="delete-dialog-desc" className="text-sm text-ink-muted leading-relaxed">
              Are you sure you want to delete this event? All tracked spend entries, ticked tasks, and custom notes will be permanently removed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                ref={cancelBtnRef}
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeleteCandidateId(null)}
              >
                Cancel
              </Button>
              <Button type="button" variant="danger" size="md" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
