import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeploymentContext } from '@pilot/contracts';
import { Monitor } from '../components/monitor';

const MODEL_X_CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

const MODEL_Y_CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-y',
  environment: 'production',
};

describe('Monitor', () => {
  it('shows the first deployment for the context by default: health, replicas, p95 latency, timeline', () => {
    render(<Monitor context={MODEL_X_CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={() => {}} />);
    expect(screen.getByText('Model X')).toBeInTheDocument();
    expect(screen.getByText('healthy')).toBeInTheDocument();
    expect(screen.getByText('4/4')).toBeInTheDocument();
    expect(screen.getByText('118 ms')).toBeInTheDocument();
    expect(screen.getByText('rollout complete')).toBeInTheDocument();
  });

  it('renders one pulse rail node per deployment for the model', () => {
    render(<Monitor context={MODEL_X_CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={() => {}} />);
    expect(screen.getAllByRole('button', { name: /Model X/ })).toHaveLength(2);
  });

  it('selecting another deployment updates the shown evidence and calls onDeploymentSelected', async () => {
    const onDeploymentSelected = vi.fn();
    render(
      <Monitor context={MODEL_X_CONTEXT} onDeploymentSelected={onDeploymentSelected} onAlertAcknowledged={() => {}} />,
    );
    await userEvent.click(screen.getAllByRole('button', { name: /Model X/ })[1]!);
    expect(screen.getByText('degraded')).toBeInTheDocument();
    expect(screen.getByText('412 ms')).toBeInTheDocument();
    expect(onDeploymentSelected).toHaveBeenCalledWith('deploy-002');
  });

  it('shows an acknowledgable alert for a degraded deployment and calls onAlertAcknowledged', async () => {
    const onAlertAcknowledged = vi.fn();
    render(
      <Monitor context={MODEL_X_CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={onAlertAcknowledged} />,
    );
    await userEvent.click(screen.getAllByRole('button', { name: /Model X/ })[1]!);
    const ackButton = screen.getByTestId('acknowledge-alert');
    expect(ackButton).toBeInTheDocument();
    await userEvent.click(ackButton);
    expect(onAlertAcknowledged).toHaveBeenCalledWith('deploy-002');
    expect(screen.queryByTestId('acknowledge-alert')).not.toBeInTheDocument();
  });

  it('does not show an acknowledge alert for a healthy deployment', () => {
    render(<Monitor context={MODEL_X_CONTEXT} onDeploymentSelected={() => {}} onAlertAcknowledged={() => {}} />);
    expect(screen.queryByTestId('acknowledge-alert')).not.toBeInTheDocument();
  });

  it('shows an accessible empty state when the model has no deployments', () => {
    render(
      <Monitor
        context={{ ...MODEL_Y_CONTEXT, modelId: 'model-unknown' }}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('No deployments');
    expect(screen.queryAllByRole('button', { name: /Model/ })).toHaveLength(0);
  });

  it('shows a loading skeleton instead of deployment evidence when loading', () => {
    render(
      <Monitor
        context={MODEL_X_CONTEXT}
        loading
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    expect(screen.getByTestId('monitor-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('rollout complete')).not.toBeInTheDocument();
  });
});
