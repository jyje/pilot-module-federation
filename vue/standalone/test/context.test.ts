import { describe, expect, it } from 'vitest';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { clusterOptions, ENVIRONMENT_OPTIONS, modelNameForId, modelOptions } from '../src/lib/context';

describe('clusterOptions', () => {
  it('lists every fixture cluster as a value/label option', () => {
    const options = clusterOptions();
    expect(options).toEqual([
      { value: 'cluster-aurora', label: 'Aurora (us-east-1)' },
      { value: 'cluster-borealis', label: 'Borealis (eu-west-1)' },
    ]);
  });
});

describe('modelOptions', () => {
  it('lists every fixture model as a value/label option', () => {
    const options = modelOptions();
    expect(options).toEqual([
      { value: 'model-x', label: 'Model X · pytorch' },
      { value: 'model-y', label: 'Model Y · onnx' },
    ]);
  });
});

describe('ENVIRONMENT_OPTIONS', () => {
  it('offers production and staging', () => {
    expect(ENVIRONMENT_OPTIONS).toEqual([
      { value: 'production', label: 'Production' },
      { value: 'staging', label: 'Staging' },
    ]);
  });
});

describe('modelNameForId', () => {
  it('resolves a known model id to its display name', () => {
    expect(modelNameForId(DEFAULT_CONTEXT.modelId)).toBe('Model X');
  });

  it('returns undefined for an unknown model id', () => {
    expect(modelNameForId('model-unknown')).toBeUndefined();
  });
});
