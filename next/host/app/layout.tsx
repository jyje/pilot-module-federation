import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Pilot · Next Host', description: 'Next.js HTTP Module Federation host' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
