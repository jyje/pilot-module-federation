import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--platform-accent))] disabled:pointer-events-none disabled:opacity-50', {
  variants: { variant: { default: 'bg-[hsl(var(--platform-accent))] text-[hsl(var(--platform-background))] hover:bg-[hsl(var(--platform-accent)/.8)]', outline: 'border border-[hsl(var(--platform-border))] bg-[hsl(var(--platform-background))] hover:bg-[hsl(var(--platform-surface))]', ghost: 'hover:bg-[hsl(var(--platform-surface))] hover:text-[hsl(var(--platform-foreground))]' } },
  defaultVariants: { variant: 'default' },
});
export function Button({ className, variant, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
