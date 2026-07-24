import { describe, expect, it } from 'vitest';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { modelNameForId, resolveContextFromQuery } from '../src/lib/context';

describe('resolveContextFromQuery', () => {
  it('falls back to the default context when the query string is empty', () => {
    expect(resolveContextFromQuery('', DEFAULT_CONTEXT)).toEqual(DEFAULT_CONTEXT);
  });

  it('adopts a fully valid query context', () => {
    const result = resolveContextFromQuery(
      '?clusterId=cluster-borealis&modelId=model-y&environment=staging',
      DEFAULT_CONTEXT,
    );
    expect(result).toEqual({
      clusterId: 'cluster-borealis',
      modelId: 'model-y',
      environment: 'staging',
    });
  });

  it('falls back per-field when a query value is unknown', () => {
    const result = resolveContextFromQuery(
      '?clusterId=cluster-unknown&modelId=model-y&environment=canary',
      DEFAULT_CONTEXT,
    );
    expect(result).toEqual({
      clusterId: DEFAULT_CONTEXT.clusterId,
      modelId: 'model-y',
      environment: DEFAULT_CONTEXT.environment,
    });
  });
});

describe('modelNameForId', () => {
  it('resolves a known model id to its display name', () => {
    expect(modelNameForId('model-x')).toBe('Model X');
  });

  it('returns undefined for an unknown model id', () => {
    expect(modelNameForId('model-unknown')).toBeUndefined();
  });
});
