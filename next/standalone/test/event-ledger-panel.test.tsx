import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { LedgerEntry } from '../lib/event-ledger';
import { EventLedgerPanel } from '../components/event-ledger-panel';

describe('EventLedgerPanel', () => {
  it('shows an empty-state message when there are no entries', () => {
    render(<EventLedgerPanel entries={[]} />);
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });

  it('renders one item per entry with a human-readable description, newest first', () => {
    const entries: LedgerEntry[] = [
      {
        id: 2,
        event: { type: 'alert-acknowledged', deploymentId: 'deploy-002' },
        timestamp: '2026-07-24T08:00:01.000Z',
      },
      {
        id: 1,
        event: { type: 'deployment-selected', deploymentId: 'deploy-001' },
        timestamp: '2026-07-24T08:00:00.000Z',
      },
    ];
    render(<EventLedgerPanel entries={entries} />);
    const items = screen.getAllByTestId('ledger-entry');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Alert acknowledged');
    expect(items[0]).toHaveTextContent('deploy-002');
    expect(items[1]).toHaveTextContent('Deployment selected');
    expect(items[1]).toHaveTextContent('deploy-001');
  });
});
