import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HostPage from '../app/page';

vi.mock('../lib/load-federated-monitor', () => ({
  loadFederatedMonitor: () =>
    Promise.resolve({
      default: ({
        selectedId,
        onSelect,
      }: {
        selectedId?: string;
        onSelect: (id: string) => void;
      }) => (
        <div data-testid="federated-monitor-stub">
          <p>selectedId: {selectedId ?? 'none'}</p>
          <button type="button" onClick={() => onSelect('deploy-002')}>
            select
          </button>
        </div>
      ),
    }),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
    configurable: true,
    get() {
      return { postMessage: vi.fn() };
    },
  });
});

function dispatchRemoteMessage(data: unknown, origin: string): void {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin }));
  });
}

const REMOTE_ORIGIN = 'http://127.0.0.1:3001';

describe('HostPage', () => {
  it('renders context controls and defaults to the iframe composition boundary', () => {
    render(<HostPage />);
    expect(screen.getByText('Cluster')).toBeInTheDocument();
    expect(screen.getByTestId('composition-boundary')).toHaveTextContent('iframe document boundary');
    expect(screen.getByTestId('remote-iframe')).toBeInTheDocument();
  });

  it('renders the federated Monitor and records a federation-sourced ledger entry when Federation is selected', async () => {
    render(<HostPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'Federation' }));
    expect(screen.getByTestId('composition-boundary')).toHaveTextContent('Federation component boundary');

    const stub = await screen.findByTestId('federated-monitor-stub');
    expect(stub).toBeInTheDocument();

    await userEvent.click(screen.getByText('select'));
    const entry = screen.getByTestId('ledger-entry');
    expect(entry).toHaveTextContent('federation');
    expect(entry).toHaveTextContent('deploy-002');
  });

  it('records a Host-owned ledger entry when the framed Remote reports ready', () => {
    render(<HostPage />);
    dispatchRemoteMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    expect(screen.getByTestId('ledger-entry')).toHaveTextContent('iframe');
  });

  it('records a Host-owned ledger entry when the framed Remote reports a deployment selection', () => {
    render(<HostPage />);
    dispatchRemoteMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    dispatchRemoteMessage({ type: 'deployment-selected', deploymentId: 'deploy-002' }, REMOTE_ORIGIN);
    const entries = screen.getAllByTestId('ledger-entry');
    expect(entries[0]).toHaveTextContent('deploy-002');
  });

  it('shows an empty event ledger before any Remote interaction', () => {
    render(<HostPage />);
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });
});
