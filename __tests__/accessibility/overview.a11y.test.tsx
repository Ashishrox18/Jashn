import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { OverviewTab } from '@/components/features/OverviewTab';
import { EventRecord } from '@/types';
import { buildFallbackPlan } from '@/lib/fallbackPlan';

// Mock recharts responsive container for jsdom
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 250 }}>{children}</div>
    ),
  };
});

const sampleEvent: EventRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2026-11-01T12:00:00Z',
  source: 'ai',
  brief: {
    eventType: 'wedding',
    title: 'Aarav & Diya Wedding',
    eventDate: '2027-01-15',
    city: 'Jaipur',
    guestCount: 300,
    totalBudgetInr: 2000000,
    vibe: 'Royal heritage',
    constraints: ['vegetarian_only'],
    weddingFunctions: ['sangeet', 'ceremony', 'reception'],
    honoreeAge: null,
    communityKind: null,
  },
  plan: buildFallbackPlan({
    eventType: 'wedding',
    title: 'Aarav & Diya Wedding',
    eventDate: '2027-01-15',
    city: 'Jaipur',
    guestCount: 300,
    totalBudgetInr: 2000000,
    vibe: 'Royal heritage',
    constraints: ['vegetarian_only'],
    weddingFunctions: ['sangeet', 'ceremony', 'reception'],
    honoreeAge: null,
    communityKind: null,
  }),
  state: {
    spentByCategory: { catering: 250000 },
    completedTaskIds: ['wed-1'],
    vendorStatus: {},
  },
};

describe('Overview Tab Accessibility (jest-axe)', () => {
  it('renders with zero axe accessibility violations', async () => {
    const { container } = render(
      <OverviewTab
        event={sampleEvent}
        allocations={{
          venue: 440000,
          catering: 640000,
          decor: 260000,
          photography: 200000,
          attire: 160000,
          entertainment: 100000,
          invitations: 50000,
          transport: 0,
          accommodation: 0,
          gifts: 50000,
          logistics: 0,
          permissions: 0,
          contingency: 100000,
          other: 0,
        }}
        budgetSummary={{
          totalAllocated: 2000000,
          totalSpent: 250000,
          remaining: 1750000,
          percentUsed: 12.5,
          overCategories: [],
        }}
        scheduling={{
          scheduled: [
            {
              id: 'wed-1',
              title: 'Lock Venue & Accommodation',
              details: 'Finalize contracts',
              category: 'venue',
              priority: 'high',
              weeksBefore: 24,
              dueDate: '2026-11-20',
            },
          ],
          compressed: false,
        }}
        daysToGo={75}
        currentPhase="Book the big things"
        today="2026-11-01"
        onNavigateToTab={jest.fn()}
        onToggleTask={jest.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
