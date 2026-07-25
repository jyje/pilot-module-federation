import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StandalonePage from '../app/page';

describe('StandalonePage', () => {
  it('renders context controls and the monitor for the default context', () => {
    render(<StandalonePage />);
    expect(screen.getByText('Cluster')).toBeInTheDocument();
    expect(screen.getByText('Model X')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Model X/ }).length).toBeGreaterThan(0);
  });

  it('selecting a deployment records a deployment-selected entry in the event ledger', async () => {
    render(<StandalonePage />);
    await userEvent.click(screen.getAllByRole('button', { name: /Model X/ })[1]!);

    const entries = screen.getAllByTestId('ledger-entry');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toHaveTextContent('Deployment selected');
    expect(entries[0]).toHaveTextContent('deploy-002');
  });

  it('acknowledging a degraded alert records an alert-acknowledged entry in the event ledger', async () => {
    render(<StandalonePage />);
    await userEvent.click(screen.getAllByRole('button', { name: /Model X/ })[1]!);
    await userEvent.click(screen.getByTestId('acknowledge-alert'));

    const entries = screen.getAllByTestId('ledger-entry');
    const text = entries.map((entry) => entry.textContent).join(' ');
    expect(text).toContain('Alert acknowledged');
    expect(text).toContain('deploy-002');
  });

  it('shows an empty event ledger before any interaction', () => {
    render(<StandalonePage />);
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });
});
