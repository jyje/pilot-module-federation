import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ModelDeployment } from '@pilot/contracts';
import { PulseRail } from '../components/pulse-rail';

const DEPLOYMENTS: readonly ModelDeployment[] = [
  { id: 'deploy-001', modelName: 'Model X', status: 'healthy', replicas: { ready: 4, desired: 4 }, p95LatencyMs: 118 },
  { id: 'deploy-002', modelName: 'Model X', status: 'degraded', replicas: { ready: 2, desired: 4 }, p95LatencyMs: 412 },
];

describe('PulseRail', () => {
  it('renders one node per deployment with an accessible label', () => {
    render(<PulseRail deployments={DEPLOYMENTS} selectedId="deploy-001" onSelect={() => {}} />);
    const nodes = screen.getAllByRole('button');
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toHaveAccessibleName(/Model X — healthy — 4\/4 replicas/);
  });

  it('marks the selected node as pressed', () => {
    render(<PulseRail deployments={DEPLOYMENTS} selectedId="deploy-002" onSelect={() => {}} />);
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelect with the deployment id when a node is clicked', async () => {
    const onSelect = vi.fn();
    render(<PulseRail deployments={DEPLOYMENTS} selectedId="deploy-001" onSelect={onSelect} />);
    await userEvent.click(screen.getAllByRole('button')[1]!);
    expect(onSelect).toHaveBeenCalledWith('deploy-002');
  });
});
