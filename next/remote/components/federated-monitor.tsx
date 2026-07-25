import type { DeploymentContext } from '@pilot/contracts';
import { resolveMonitorState } from '../lib/monitor';
import { MonitorView } from './monitor-view';

/**
 * Federation-exposed entry point. Deliberately holds no React state of its
 * own: selection/acknowledgement live in the Host, which owns every hook in
 * this cross-origin boundary. See spikes/next-raw-federation/README.md — an
 * independently-built Remote and Host cannot yet share a single React
 * instance reliably, so an exposed component that calls hooks itself would
 * crash ("Invalid hook call") the moment it renders inside the Host's tree.
 */
export default function FederatedMonitor({
  context,
  selectedId,
  acknowledgedIds,
  onSelect,
  onAcknowledge,
}: {
  context: DeploymentContext;
  selectedId?: string;
  acknowledgedIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const state = resolveMonitorState(context.modelId, selectedId);
  const activeSelectedId = selectedId ?? state.selected?.id ?? '';
  const showAcknowledge = state.selected?.status === 'degraded' && !acknowledgedIds.has(state.selected.id);

  return (
    <MonitorView
      state={state}
      selectedId={activeSelectedId}
      showAcknowledge={showAcknowledge}
      onSelect={onSelect}
      onAcknowledge={onAcknowledge}
    />
  );
}
