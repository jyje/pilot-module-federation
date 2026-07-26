import type { ComponentProps } from 'react';

/** Local shadcn-style primitive; the Remote owns its UI implementation. */
export function Button({ className = '', ...props }: ComponentProps<'button'>) {
  return <button className={`inline-flex h-9 items-center justify-center rounded-md bg-[hsl(var(--platform-accent))] px-3 text-sm font-semibold text-[hsl(var(--platform-background))] transition-colors hover:bg-[hsl(var(--platform-accent)/.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--platform-accent))] ${className}`} {...props} />;
}
