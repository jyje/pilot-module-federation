import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { DeploymentContext } from '@pilot/contracts';
import ContextControls from '../src/components/ContextControls.vue';
import { Select } from '../src/components/ui/select';

const CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

describe('ContextControls', () => {
  it('renders a labelled select for cluster, model, and environment', () => {
    const wrapper = mount(ContextControls, { props: { context: CONTEXT } });
    expect(wrapper.text()).toContain('Cluster');
    expect(wrapper.text()).toContain('Model');
    expect(wrapper.text()).toContain('Environment');
    expect(wrapper.findAllComponents(Select)).toHaveLength(3);
  });

  it('emits update:context with the new clusterId when the cluster select changes', async () => {
    const wrapper = mount(ContextControls, { props: { context: CONTEXT } });
    const [clusterSelect] = wrapper.findAllComponents(Select);
    await clusterSelect!.vm.$emit('update:modelValue', 'cluster-borealis');
    expect(wrapper.emitted('update:context')?.[0]?.[0]).toEqual({
      ...CONTEXT,
      clusterId: 'cluster-borealis',
    });
  });

  it('emits update:context with the new modelId when the model select changes', async () => {
    const wrapper = mount(ContextControls, { props: { context: CONTEXT } });
    const [, modelSelect] = wrapper.findAllComponents(Select);
    await modelSelect!.vm.$emit('update:modelValue', 'model-y');
    expect(wrapper.emitted('update:context')?.[0]?.[0]).toEqual({
      ...CONTEXT,
      modelId: 'model-y',
    });
  });

  it('emits update:context with the new environment when the environment select changes', async () => {
    const wrapper = mount(ContextControls, { props: { context: CONTEXT } });
    const [, , environmentSelect] = wrapper.findAllComponents(Select);
    await environmentSelect!.vm.$emit('update:modelValue', 'staging');
    expect(wrapper.emitted('update:context')?.[0]?.[0]).toEqual({
      ...CONTEXT,
      environment: 'staging',
    });
  });

  it('ignores a non-string update:modelValue payload', async () => {
    const wrapper = mount(ContextControls, { props: { context: CONTEXT } });
    const [clusterSelect] = wrapper.findAllComponents(Select);
    await clusterSelect!.vm.$emit('update:modelValue', undefined);
    expect(wrapper.emitted('update:context')).toBeUndefined();
  });
});
