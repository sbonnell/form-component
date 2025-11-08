import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Schema-Driven Form Component Demo',
  description: 'Interactive demos of the schema-driven form component',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
