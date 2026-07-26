import type { ComponentProps } from 'react';
export function Card({ className = '', ...props }: ComponentProps<'section'>) { return <section className={`rounded-xl border border-[hsl(var(--platform-border))] bg-[hsl(var(--platform-surface))] p-5 text-[hsl(var(--platform-foreground))] ${className}`} {...props} />; }
export function CardTitle({ className = '', ...props }: ComponentProps<'h2'>) { return <h2 className={`font-mono text-lg font-semibold ${className}`} {...props} />; }
