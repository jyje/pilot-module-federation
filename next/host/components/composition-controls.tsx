'use client';

import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export type CompositionMode = 'federation' | 'iframe';

export function CompositionControls({
  mode,
  onModeChange,
}: {
  mode: CompositionMode;
  onModeChange: (mode: CompositionMode) => void;
}) {
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => {
        if (value === 'federation' || value === 'iframe') onModeChange(value);
      }}
    >
      <TabsList aria-label="Composition mode">
        <TabsTrigger value="federation">Federation</TabsTrigger>
        <TabsTrigger value="iframe">iframe</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
