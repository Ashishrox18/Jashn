import type { Metadata } from 'next';
import { BriefWizard } from '@/components/features/BriefWizard';

export const metadata: Metadata = {
  title: 'Plan a New Event — Jashn',
  description: 'Describe your event once; Jashn produces an exact rupee budget, scheduled timeline, and vendor checklists.',
};

export default function NewEventPage() {
  return (
    <div className="py-4 md:py-6">
      <BriefWizard />
    </div>
  );
}

