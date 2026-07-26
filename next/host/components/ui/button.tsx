import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('platform-button', {
  variants: { variant: { default: '', outline: 'platform-button--outline', ghost: 'platform-button--ghost' } },
  defaultVariants: { variant: 'default' },
});
export function Button({ className, variant, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
