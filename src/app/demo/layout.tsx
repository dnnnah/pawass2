import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Demo de PawPass', template: '%s | Demo de PawPass' },
  robots: { index: false, follow: false, noarchive: true },
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
