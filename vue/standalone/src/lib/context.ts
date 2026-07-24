import { CLUSTERS, MODELS } from '@pilot/fixtures';

export interface SelectOption {
  value: string;
  label: string;
}

export const ENVIRONMENT_OPTIONS: readonly SelectOption[] = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
];

export function clusterOptions(): SelectOption[] {
  return CLUSTERS.map((cluster) => ({ value: cluster.id, label: `${cluster.name} (${cluster.region})` }));
}

export function modelOptions(): SelectOption[] {
  return MODELS.map((model) => ({ value: model.id, label: `${model.name} · ${model.framework}` }));
}

export function modelNameForId(modelId: string): string | undefined {
  return MODELS.find((model) => model.id === modelId)?.name;
}
