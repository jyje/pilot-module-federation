'use client';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';

export default function RemoteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Alert variant="destructive" role="alert">
        <AlertTitle>Model deployment monitor unavailable</AlertTitle>
        <AlertDescription>
          The Remote failed to render deployment evidence. Retry, or reload if the problem persists.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="destructive" onClick={reset}>
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </main>
  );
}
