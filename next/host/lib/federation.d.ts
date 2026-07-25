declare module 'next_remote/FederatedMonitor' {
  import type { DeploymentContext } from '@pilot/contracts';

  const FederatedMonitor: (props: {
    context: DeploymentContext;
    selectedId?: string | undefined;
    acknowledgedIds: ReadonlySet<string>;
    onSelect: (id: string) => void;
    onAcknowledge: (id: string) => void;
  }) => JSX.Element;

  export default FederatedMonitor;
}
