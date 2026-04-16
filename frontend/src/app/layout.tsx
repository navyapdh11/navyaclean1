import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/layout/Providers';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CleanPro Enterprise | Cleaning Services Sydney',
  description: 'Professional cleaning for homes and offices. Book online, track your service, and get a clean you can see.',
  keywords: ['cleaning', 'services', 'residential', 'commercial', 'deep clean', 'office'],
  openGraph: {
    title: 'CleanPro Enterprise | Cleaning Services Sydney',
    description: 'Professional cleaning for homes and offices. Book online and get a clean you can see.',
    url: 'https://cleaning-services-enterprise-2026.vercel.app',
    siteName: 'CleanPro Enterprise',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CleanPro Enterprise - Cleaning Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CleanPro Enterprise | Cleaning Services Sydney',
    description: 'Professional cleaning for homes and offices.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-neutral-50">
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
