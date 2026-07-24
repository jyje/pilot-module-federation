<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

defineProps<{ mode: 'federation' | 'iframe' }>();
const emit = defineEmits<{ 'update:mode': [mode: 'federation' | 'iframe'] }>();

function onModelValueUpdate(value: unknown): void {
  if (value === 'federation' || value === 'iframe') {
    emit('update:mode', value);
  }
}
</script>

<template>
  <Tabs :model-value="mode" class="composition-controls" @update:model-value="onModelValueUpdate">
    <TabsList aria-label="Composition mode">
      <TabsTrigger value="federation">Federation</TabsTrigger>
      <TabsTrigger value="iframe">iframe</TabsTrigger>
    </TabsList>
  </Tabs>
</template>
