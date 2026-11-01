import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import HomePage from '@/app/page';

jest.mock('@/hooks/useEvents', () => ({
  useEvents: () => ({
    events: [
      {
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
        plan: {
          summary: 'Wedding plan in Jaipur',
          budget: [{ category: 'venue', percent: 25, rationale: '', tips: [] }],
          timeline: [{ id: '1', title: 'Task 1', details: '', category: 'venue', priority: 'high', weeksBefore: 12 }],
          vendors: [],
          ideas: [],
          risks: [],
          confidence: 0.95,
        },
        state: {
          spentByCategory: { venue: 100000 },
          completedTaskIds: ['1'],
          vendorStatus: {},
        },
      },
    ],
    isLoaded: true,
    removeEvent: jest.fn(),
    exportBackup: jest.fn(),
    importBackup: jest.fn(),
  }),
}));

describe('Home Page Accessibility (jest-axe)', () => {
  it('renders with zero axe accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
