'use client';

import { useEffect, useState } from 'react';
import type { DeploymentContext } from '@pilot/contracts';
import { resolveMonitorState } from '../lib/monitor';
import { MonitorView } from './monitor-view';

export function Monitor({
  context,
  loading = false,
  onDeploymentSelected,
  onAlertAcknowledged,
}: {
  context: DeploymentContext;
  loading?: boolean;
  onDeploymentSelected: (id: string) => void;
  onAlertAcknowledged: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>();
  const [acknowledgedIds, setAcknowledgedIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    setSelectedId(undefined);
  }, [context.modelId]);

  const state = resolveMonitorState(context.modelId, selectedId);
  const activeSelectedId = selectedId ?? state.selected?.id ?? '';
  const showAcknowledge = state.selected?.status === 'degraded' && !acknowledgedIds.has(state.selected.id);

  function selectDeployment(id: string): void {
    setSelectedId(id);
    onDeploymentSelected(id);
  }

  function acknowledge(id: string): void {
    setAcknowledgedIds((current) => new Set(current).add(id));
    onAlertAcknowledged(id);
  }

  return (
    <MonitorView
      state={state}
      selectedId={activeSelectedId}
      loading={loading}
      showAcknowledge={showAcknowledge}
      onSelect={selectDeployment}
      onAcknowledge={acknowledge}
    />
  );
}
