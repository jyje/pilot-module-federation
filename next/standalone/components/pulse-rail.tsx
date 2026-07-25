import type { ModelDeployment } from '@pilot/contracts';

const STATUS_GLYPH: Record<ModelDeployment['status'], string> = {
  healthy: '●',
  deploying: '◐',
  degraded: '●',
  paused: '○',
};

const STATUS_CLASS: Record<ModelDeployment['status'], string> = {
  healthy: 'border-[hsl(var(--platform-accent))] text-[hsl(var(--platform-accent))]',
  deploying:
    'border-[hsl(var(--platform-accent))] text-[hsl(var(--platform-accent))] animate-pulse motion-reduce:animate-none',
  degraded: 'border-[hsl(var(--platform-warning))] text-[hsl(var(--platform-warning))]',
  paused: 'border-[hsl(var(--platform-muted))] text-[hsl(var(--platform-muted))]',
};

function statusLabel(deployment: ModelDeployment): string {
  return `${deployment.modelName} — ${deployment.status} — ${deployment.replicas.ready}/${deployment.replicas.desired} replicas`;
}

export function PulseRail({
  deployments,
  selectedId,
  onSelect,
}: {
  deployments: readonly ModelDeployment[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ol aria-label="Deployment pulse rail" className="flex items-center gap-8 list-none m-0 p-0">
      {deployments.map((deployment) => (
        <li key={deployment.id} className="flex items-center">
          <button
            type="button"
            aria-pressed={deployment.id === selectedId}
            aria-label={statusLabel(deployment)}
            onClick={() => onSelect(deployment.id)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[hsl(var(--platform-surface))] text-base ${STATUS_CLASS[deployment.status]} ${deployment.id === selectedId ? 'ring-2 ring-[hsl(var(--platform-accent)/0.4)]' : ''}`}
          >
            <span aria-hidden="true">{STATUS_GLYPH[deployment.status]}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
