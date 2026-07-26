import type { ComponentProps } from 'react';

/** Local shadcn-style primitive; the Remote owns its UI implementation. */
export function Button({ className = '', ...props }: ComponentProps<'button'>) {
  return <button className={`platform-button ${className}`} {...props} />;
}
