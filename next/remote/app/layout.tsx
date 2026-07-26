import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Pilot · Next Remote', description: 'Next.js HTTP Module Federation remote' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
