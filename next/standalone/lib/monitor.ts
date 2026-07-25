import { deploymentsForModel, timelineForDeployment } from '@pilot/fixtures';
import type { ModelDeployment } from '@pilot/contracts';
import { modelNameForId } from './context';

export interface MonitorState {
  deployments: readonly ModelDeployment[];
  selected?: ModelDeployment | undefined;
  timeline: ReturnType<typeof timelineForDeployment>;
}

export function resolveMonitorState(modelId: string, selectedId?: string): MonitorState {
  const modelName = modelNameForId(modelId);
  const deployments = modelName ? deploymentsForModel(modelName) : [];
  const selected = deployments.find((deployment) => deployment.id === selectedId) ?? deployments[0];

  return {
    deployments,
    selected,
    timeline: selected ? timelineForDeployment(selected.id) : [],
  };
}
