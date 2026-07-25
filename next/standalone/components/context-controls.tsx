'use client';

import type { DeploymentContext } from '@pilot/contracts';
import { clusterOptions, ENVIRONMENT_OPTIONS, modelOptions } from '../lib/context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ContextControls({
  context,
  onContextChange,
}: {
  context: DeploymentContext;
  onContextChange: (context: DeploymentContext) => void;
}) {
  function updateCluster(clusterId: string): void {
    onContextChange({ ...context, clusterId });
  }

  function updateModel(modelId: string): void {
    onContextChange({ ...context, modelId });
  }

  function updateEnvironment(environment: string): void {
    if (environment !== 'production' && environment !== 'staging') return;
    onContextChange({ ...context, environment });
  }

  return (
    <div role="group" aria-label="Deployment context" className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Cluster</span>
        <Select value={context.clusterId} onValueChange={updateCluster}>
          <SelectTrigger aria-label="Cluster" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {clusterOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Model</span>
        <Select value={context.modelId} onValueChange={updateModel}>
          <SelectTrigger aria-label="Model" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Environment</span>
        <Select value={context.environment} onValueChange={updateEnvironment}>
          <SelectTrigger aria-label="Environment" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENVIRONMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}
