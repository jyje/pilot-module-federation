import { describe, expect, it } from 'vitest';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { clusterOptions, ENVIRONMENT_OPTIONS, modelOptions, resolveContextFromQuery } from '../lib/context';

describe('clusterOptions', () => {
  it('returns one option per fixture cluster with id as value', () => {
    const options = clusterOptions();
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ value: 'cluster-aurora', label: expect.stringContaining('Aurora') });
    expect(options[1]).toEqual({ value: 'cluster-borealis', label: expect.stringContaining('Borealis') });
  });
});

describe('modelOptions', () => {
  it('returns one option per fixture model with id as value', () => {
    const options = modelOptions();
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ value: 'model-x', label: expect.stringContaining('Model X') });
    expect(options[1]).toEqual({ value: 'model-y', label: expect.stringContaining('Model Y') });
  });
});

describe('ENVIRONMENT_OPTIONS', () => {
  it('lists production and staging', () => {
    expect(ENVIRONMENT_OPTIONS).toEqual([
      { value: 'production', label: expect.any(String) },
      { value: 'staging', label: expect.any(String) },
    ]);
  });
});

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
