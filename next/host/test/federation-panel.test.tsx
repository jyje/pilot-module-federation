import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeploymentContext } from '@pilot/contracts';
import { FederationPanel } from '../components/federation-panel';

vi.mock('../lib/load-federated-monitor', () => ({
  loadFederatedMonitor: () =>
    Promise.resolve({
      default: ({
        selectedId,
        onSelect,
        onAcknowledge,
      }: {
        context: DeploymentContext;
        selectedId?: string;
        acknowledgedIds: ReadonlySet<string>;
        onSelect: (id: string) => void;
        onAcknowledge: (id: string) => void;
      }) => (
        <div data-testid="federated-monitor-stub">
          <p>selectedId: {selectedId ?? 'none'}</p>
          <button type="button" onClick={() => onSelect('deploy-002')}>
            select
          </button>
          <button type="button" onClick={() => onAcknowledge('deploy-002')}>
            acknowledge
          </button>
        </div>
      ),
    }),
}));

const CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

describe('FederationPanel', () => {
  it('lazily renders the federated Monitor and owns the selection/acknowledgement state', async () => {
    const onDeploymentSelected = vi.fn();
    const onAlertAcknowledged = vi.fn();
    render(
      <FederationPanel
        context={CONTEXT}
        onDeploymentSelected={onDeploymentSelected}
        onAlertAcknowledged={onAlertAcknowledged}
      />,
    );

    const stub = await screen.findByTestId('federated-monitor-stub');
    expect(stub).toHaveTextContent('selectedId: none');

    await userEvent.click(screen.getByText('select'));
    expect(onDeploymentSelected).toHaveBeenCalledWith('deploy-002');
    expect(screen.getByText('selectedId: deploy-002')).toBeInTheDocument();

    await userEvent.click(screen.getByText('acknowledge'));
    expect(onAlertAcknowledged).toHaveBeenCalledWith('deploy-002');
  });

  it('resets the selection when the context model changes', async () => {
    const { rerender } = render(
      <FederationPanel context={CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={() => {}} />,
    );
    await screen.findByTestId('federated-monitor-stub');
    await userEvent.click(screen.getByText('select'));
    expect(screen.getByText('selectedId: deploy-002')).toBeInTheDocument();

    rerender(
      <FederationPanel
        context={{ ...CONTEXT, modelId: 'model-y' }}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    expect(await screen.findByText('selectedId: none')).toBeInTheDocument();
  });
});
