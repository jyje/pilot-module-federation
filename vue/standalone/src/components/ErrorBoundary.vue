<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

const hasError = ref(false);

onErrorCaptured(() => {
  hasError.value = true;
  return false;
});

function retry(): void {
  hasError.value = false;
}
</script>

<template>
  <Alert v-if="hasError" variant="destructive">
    <AlertTitle>Model deployment monitor unavailable</AlertTitle>
    <AlertDescription>
      The Remote failed to render deployment evidence. Retry, or reload if the problem persists.
    </AlertDescription>
    <AlertAction>
      <Button data-testid="error-boundary-retry" size="sm" variant="destructive" @click="retry">
        Retry
      </Button>
    </AlertAction>
  </Alert>
  <slot v-else />
</template>
