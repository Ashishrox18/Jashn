'use client';

import React, { useState } from 'react';
import { EventRecord, Category, VendorStatus } from '@/types';
import { addDaysUtc } from '@/lib/engines/timeline';
import { formatInr, formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { useToast } from '@/components/ui/Toast';
import {
  Briefcase,
  Calendar,
  IndianRupee,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export interface VendorsTabProps {
  event: EventRecord;
  onSetVendorStatus: (cat: Category, status: VendorStatus) => void;
}

const statusOptions: { value: VendorStatus; label: string }[] = [
  { value: 'to_contact', label: 'To Contact' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quote Received' },
  { value: 'booked', label: 'Booked & Confirmed' },
  { value: 'dropped', label: 'Dropped / Not Needed' },
];

export function VendorsTab({ event, onSetVendorStatus }: VendorsTabProps) {
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyQuestions = (cat: Category, questions: string[]) => {
    const text = `Questions to ask ${cat.toUpperCase()} vendor for ${event.brief.title}:\n\n` +
      questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(cat);
    showToast(`Questions copied to clipboard!`, 'success');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-4 rounded-xl border border-border">
        <h2 className="text-xl font-heading font-bold text-ink">
          Vendor Vetting & Checklist Pipeline
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Estimates only — confirm with local vendor quotes. Jashn produces vetting checklists, not business directories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {event.plan.vendors.map((vendor) => {
          const currentStatus = event.state.vendorStatus[vendor.category] || 'to_contact';
          const bookByDate = addDaysUtc(
            event.brief.eventDate,
            -vendor.bookWeeksBefore * 7
          );

          return (
            <Card
              key={vendor.category}
              className="flex flex-col justify-between p-5 md:p-6 space-y-4"
            >
              <div>
                {/* Header & Status Dropdown */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      Category
                    </span>
                    <h3 className="text-lg font-heading font-black text-ink capitalize">
                      {vendor.category}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <label htmlFor={`status-${vendor.category}`} className="sr-only">
                      Status for {vendor.category}
                    </label>
                    <select
                      id={`status-${vendor.category}`}
                      value={currentStatus}
                      onChange={(e) =>
                        onSetVendorStatus(vendor.category, e.target.value as VendorStatus)
                      }
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* What to Book */}
                <div className="p-3 rounded-lg bg-surface-2/60 border border-border/80 text-sm mb-4">
                  <span className="font-semibold text-ink block text-xs uppercase tracking-wider mb-1">
                    Requirement:
                  </span>
                  <p className="text-ink leading-snug">{vendor.whatToBook}</p>
                </div>

                {/* Deadlines & Estimated Cost */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-2.5 rounded-lg border border-border bg-surface">
                    <span className="text-ink-muted block mb-0.5">Book By Date:</span>
                    <span className="font-bold text-ink flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{formatDate(bookByDate)}</span>
                    </span>
                    <span className="text-[10px] text-ink-muted mt-0.5 block">
                      ({vendor.bookWeeksBefore} wks prior)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-surface">
                    <span className="text-ink-muted block mb-0.5">Typical Range:</span>
                    <span className="font-bold text-primary flex items-center gap-0.5">
                      {formatInr(vendor.typicalCostMinInr)} – {formatInr(vendor.typicalCostMaxInr)}
                    </span>
                    <span className="text-[10px] text-ink-muted mt-0.5 block">
                      Market estimate
                    </span>
                  </div>
                </div>

                {/* Vetting Questions to Ask */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-accent" />
                      <span>Essential Vetting Questions:</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyQuestions(vendor.category, vendor.questionsToAsk)}
                      className="text-xs h-7 px-2 min-h-[36px]"
                    >
                      {copiedIndex === vendor.category ? (
                        <>
                          <Check className="w-3 h-3 text-ok mr-1" />
                          <span className="text-ok">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          <span>Copy Questions</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-ink-muted pl-1 bg-surface-2/30 p-2.5 rounded-lg border border-border/60">
                    {vendor.questionsToAsk.map((q, i) => (
                      <li key={i} className="leading-relaxed">
                        <span className="text-ink font-medium">{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Red Flags Warning Box */}
                {vendor.redFlags.length > 0 && (
                  <div className="p-3 rounded-lg bg-danger-soft/30 border border-danger/20 text-xs text-danger">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Watch Out for Red Flags:</span>
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 pl-1 text-ink-muted">
                      {vendor.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
