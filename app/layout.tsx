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
      <body className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main>{children}</main>
        
        {/* Footer */}
        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
