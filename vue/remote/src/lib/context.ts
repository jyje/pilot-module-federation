import type { DeploymentContext, Environment } from '@pilot/contracts';
import { CLUSTERS, MODELS } from '@pilot/fixtures';

const ENVIRONMENTS: readonly Environment[] = ['production', 'staging'];

function isKnownCluster(clusterId: string | null): clusterId is string {
  return clusterId !== null && CLUSTERS.some((cluster) => cluster.id === clusterId);
}

function isKnownModel(modelId: string | null): modelId is string {
  return modelId !== null && MODELS.some((model) => model.id === modelId);
}

function isEnvironment(value: string | null): value is Environment {
  return value !== null && ENVIRONMENTS.includes(value as Environment);
}

export function resolveContextFromQuery(
  search: string,
  fallback: DeploymentContext,
): DeploymentContext {
  const params = new URLSearchParams(search);
  const clusterId = params.get('clusterId');
  const modelId = params.get('modelId');
  const environment = params.get('environment');

  return {
    clusterId: isKnownCluster(clusterId) ? clusterId : fallback.clusterId,
    modelId: isKnownModel(modelId) ? modelId : fallback.modelId,
    environment: isEnvironment(environment) ? environment : fallback.environment,
  };
}

export function modelNameForId(modelId: string): string | undefined {
  return MODELS.find((model) => model.id === modelId)?.name;
}
