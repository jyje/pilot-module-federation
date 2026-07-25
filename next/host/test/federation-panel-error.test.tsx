import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeploymentContext } from '@pilot/contracts';
import { FederationPanel } from '../components/federation-panel';

vi.mock('../lib/load-federated-monitor', () => ({
  loadFederatedMonitor: () => Promise.reject(new Error('Loading script failed')),
}));

const CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

describe('FederationPanel — Remote unreachable', () => {
  it('shows a fallback with a retry action instead of crashing the Host', async () => {
    render(<FederationPanel context={CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={() => {}} />);

    expect(await screen.findByTestId('federation-error')).toBeInTheDocument();
    expect(screen.getByTestId('federation-retry')).toBeInTheDocument();
  });

  it('re-attempts the federated import when Retry is clicked', async () => {
    render(<FederationPanel context={CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={() => {}} />);
    await screen.findByTestId('federation-error');

    await userEvent.click(screen.getByTestId('federation-retry'));

    expect(await screen.findByTestId('federation-error')).toBeInTheDocument();
  });
});
