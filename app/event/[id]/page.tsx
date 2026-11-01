'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEvent } from '@/hooks/useEvent';
import { formatDate, formatRelativeDays, formatInr } from '@/lib/format';
import { Tabs, TabPanel, TabItem } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OverviewTab } from '@/components/features/OverviewTab';
import { BudgetTab } from '@/components/features/BudgetTab';
import { TimelineTab } from '@/components/features/TimelineTab';
import { VendorsTab } from '@/components/features/VendorsTab';
import { IdeasTab } from '@/components/features/IdeasTab';
import {
  LayoutDashboard,
  IndianRupee,
  CalendarDays,
  Briefcase,
  Lightbulb,
  Printer,
  ChevronLeft,
  MapPin,
  Users,
  Sparkles,
} from 'lucide-react';

const workspaceTabs: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'budget', label: 'Budget & Spend', icon: <IndianRupee className="w-4 h-4" /> },
  { id: 'timeline', label: 'Timeline & Milestones', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'vendors', label: 'Vendors Pipeline', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'ideas', label: 'Ideas & Assistant', icon: <Lightbulb className="w-4 h-4" /> },
];

export default function EventWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = typeof params?.['id'] === 'string' ? params['id'] : '';

  const [activeTab, setActiveTab] = useState('overview');

  const {
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
  } = useEvent(eventId);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-12">
        <EmptyState
          title="Celebration not found"
          description="The event you are looking for does not exist in your local storage or has been deleted."
          actionLabel="Return to My Events"
          onAction={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary transition-colors min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Events</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            <span>Print Event Brief</span>
          </Button>
        </div>
      </div>

      {/* Event Header Banner */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
              {event.brief.eventType}
            </span>
            <span className="text-xs font-semibold text-ink-muted">
              Created {formatDate(event.createdAt.slice(0, 10))}
            </span>
            {event.source === 'fallback' ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 text-ink-muted">
                Standard Blueprint
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Customized
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-heading font-black text-ink">
            {event.brief.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-ink-muted mt-2">
            <span className="flex items-center gap-1 font-medium text-ink">
              <CalendarDays className="w-4 h-4 text-accent" />
              <span>{formatDate(event.brief.eventDate)}</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-accent">
              {formatRelativeDays(daysToGo)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-accent" />
              <span>{event.brief.city}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-accent" />
              <span>{event.brief.guestCount} Guests</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-primary">
              Total {formatInr(event.brief.totalBudgetInr)}
            </span>
          </div>
        </div>
      </div>

      {/* Accessible Tabs Navigation */}
      <div className="no-print">
        <Tabs
          tabs={workspaceTabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
          ariaLabel="Event Workspace Navigation Tabs"
        />
      </div>

      {/* Tab Panels */}
      <div>
        <TabPanel id="overview" activeTab={activeTab}>
          <OverviewTab
            event={event}
            allocations={allocations}
            budgetSummary={budgetSummary}
            scheduling={scheduling}
            daysToGo={daysToGo}
            currentPhase={currentPhase}
            today={today}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            onToggleTask={toggleTask}
          />
        </TabPanel>

        <TabPanel id="budget" activeTab={activeTab}>
          <BudgetTab
            event={event}
            allocations={allocations}
            budgetSummary={budgetSummary}
            onUpdateSpend={updateSpend}
            onApplyRebalance={applyBudgetRebalance}
          />
        </TabPanel>

        <TabPanel id="timeline" activeTab={activeTab}>
          <TimelineTab
            event={event}
            scheduling={scheduling}
            today={today}
            onToggleTask={toggleTask}
          />
        </TabPanel>

        <TabPanel id="vendors" activeTab={activeTab}>
          <VendorsTab
            event={event}
            onSetVendorStatus={setVendorCategoryStatus}
          />
        </TabPanel>

        <TabPanel id="ideas" activeTab={activeTab}>
          <IdeasTab
            event={event}
            totalSpent={budgetSummary.totalSpent}
          />
        </TabPanel>
      </div>

      {/* Print View Specific Brief Layout */}
      <div className="hidden print:block space-y-6 pt-4">
        <h2 className="text-2xl font-bold font-heading">Event Brief & Action Plan</h2>
        <p className="text-sm">{event.plan.summary}</p>

        <h3 className="text-lg font-bold border-b pb-1 mt-4">Budget Breakdown</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b">
              <th>Category</th>
              <th>Share %</th>
              <th className="text-right">Allocated</th>
              <th className="text-right">Spent</th>
            </tr>
          </thead>
          <tbody>
            {event.plan.budget.map((b) => (
              <tr key={b.category} className="border-b">
                <td className="py-1 capitalize">{b.category}</td>
                <td className="py-1">{b.percent}%</td>
                <td className="py-1 text-right">{formatInr(allocations[b.category] ?? 0)}</td>
                <td className="py-1 text-right">{formatInr(event.state.spentByCategory[b.category] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-lg font-bold border-b pb-1 mt-6">Timeline Roadmap</h3>
        <ul className="text-xs space-y-2">
          {scheduling.scheduled.map((t) => (
            <li key={t.id} className="border-b pb-1">
              <strong>{formatDate(t.dueDate)}</strong> — {t.title} ({t.priority.toUpperCase()})
              <p className="text-gray-600">{t.details}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
