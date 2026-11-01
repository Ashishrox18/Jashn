import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { BriefWizard } from '@/components/features/BriefWizard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Wizard Step 1 Accessibility (jest-axe)', () => {
  it('renders with zero axe accessibility violations on Step 1', async () => {
    const { container } = render(<BriefWizard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
