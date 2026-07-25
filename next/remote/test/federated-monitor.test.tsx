import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeploymentContext } from '@pilot/contracts';
import FederatedMonitor from '../components/federated-monitor';

const MODEL_X_CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

describe('FederatedMonitor', () => {
  it('renders the deployment for a Host-provided selectedId without owning any internal state', () => {
    render(
      <FederatedMonitor
        context={MODEL_X_CONTEXT}
        selectedId="deploy-002"
        acknowledgedIds={new Set()}
        onSelect={() => {}}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.getByText('degraded')).toBeInTheDocument();
    expect(screen.getByText('412 ms')).toBeInTheDocument();
  });

  it('falls back to the first deployment when selectedId is undefined', () => {
    render(
      <FederatedMonitor
        context={MODEL_X_CONTEXT}
        acknowledgedIds={new Set()}
        onSelect={() => {}}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('calls onSelect when a pulse-rail node is clicked, without changing its own rendering', async () => {
    const onSelect = vi.fn();
    render(
      <FederatedMonitor
        context={MODEL_X_CONTEXT}
        selectedId="deploy-001"
        acknowledgedIds={new Set()}
        onSelect={onSelect}
        onAcknowledge={() => {}}
      />,
    );
    await userEvent.click(screen.getAllByRole('button', { name: /Model X/ })[1]!);
    expect(onSelect).toHaveBeenCalledWith('deploy-002');
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('shows the acknowledge action only when the Host has not marked it acknowledged', () => {
    const { rerender } = render(
      <FederatedMonitor
        context={MODEL_X_CONTEXT}
        selectedId="deploy-002"
        acknowledgedIds={new Set()}
        onSelect={() => {}}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.getByTestId('acknowledge-alert')).toBeInTheDocument();

    rerender(
      <FederatedMonitor
        context={MODEL_X_CONTEXT}
        selectedId="deploy-002"
        acknowledgedIds={new Set(['deploy-002'])}
        onSelect={() => {}}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.queryByTestId('acknowledge-alert')).not.toBeInTheDocument();
  });
});
