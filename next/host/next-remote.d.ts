declare module 'next_observability/ObservabilityRemote' {
  import type { ComponentType } from 'react';
  import type { PlatformContext } from '@pilot/contracts';
  const ObservabilityRemote: ComponentType<{ platform: PlatformContext; summary: Record<string, number> | null; onHello: () => void }>;
  export default ObservabilityRemote;
}
declare module 'next_governance/GovernanceRemote' {
  import type { ComponentType } from 'react';
  import type { PlatformContext } from '@pilot/contracts';
  const GovernanceRemote: ComponentType<{ platform: PlatformContext; summary: Record<string, number> | null; onHello: () => void }>;
  export default GovernanceRemote;
}
