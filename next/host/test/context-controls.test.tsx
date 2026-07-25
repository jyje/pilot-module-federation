import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeploymentContext } from '@pilot/contracts';
import { ContextControls } from '../components/context-controls';

vi.mock('../components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <select value={value} onChange={(event) => onValueChange(event.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => children,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => children,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

const CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

describe('ContextControls', () => {
  it('renders a labelled select for cluster, model, and environment', () => {
    render(<ContextControls context={CONTEXT} onContextChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Cluster' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Model' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Environment' })).toBeInTheDocument();
  });

  it('calls onContextChange with the new clusterId when the cluster select changes', async () => {
    const onContextChange = vi.fn();
    render(<ContextControls context={CONTEXT} onContextChange={onContextChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Cluster' }), 'cluster-borealis');
    expect(onContextChange).toHaveBeenCalledWith({ ...CONTEXT, clusterId: 'cluster-borealis' });
  });

  it('calls onContextChange with the new modelId when the model select changes', async () => {
    const onContextChange = vi.fn();
    render(<ContextControls context={CONTEXT} onContextChange={onContextChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Model' }), 'model-y');
    expect(onContextChange).toHaveBeenCalledWith({ ...CONTEXT, modelId: 'model-y' });
  });

  it('calls onContextChange with the new environment when the environment select changes', async () => {
    const onContextChange = vi.fn();
    render(<ContextControls context={CONTEXT} onContextChange={onContextChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Environment' }), 'staging');
    expect(onContextChange).toHaveBeenCalledWith({ ...CONTEXT, environment: 'staging' });
  });
});
