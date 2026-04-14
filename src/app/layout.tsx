import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3D Graph Mindmap',
  description: 'Interactive 3D graph visualization for investigative case data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen w-full bg-shell-bg text-shell-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
