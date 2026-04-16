import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/layout/Providers';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { generateLocalBusinessSchema } from '@/lib/seo/schema';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cleaning-services-enterprise-2026.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'CleanPro Enterprise | Professional Cleaning Services Australia',
    template: '%s | CleanPro AU',
  },
  description: 'Professional cleaning for homes and offices across Australia. Bond-back guarantee, eco-friendly products, instant online booking. From $120 AUD incl. GST.',
  keywords: [
    'cleaning services',
    'end of lease cleaning',
    'bond cleaning',
    'commercial cleaning',
    'carpet cleaning',
    'house cleaning',
    'Australia',
    'Sydney',
    'Melbourne',
    'Brisbane',
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CleanPro Enterprise | Professional Cleaning Services Australia',
    description: 'Bond-back guaranteed cleaning. Book online in 60 seconds. All prices incl. GST.',
    url: baseUrl,
    siteName: 'CleanPro Enterprise',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CleanPro Enterprise - Professional Cleaning Services',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CleanPro Enterprise | Professional Cleaning Services Australia',
    description: 'Bond-back guaranteed cleaning across Australia. Book online in 60 seconds.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localBusinessSchema = generateLocalBusinessSchema({
    businessName: 'CleanPro Enterprise',
    abn: '12 345 678 901',
    serviceAreas: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
  });

  return (
    <html lang="en-AU" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <meta name="geo.region" content="AU" />
        <meta name="geo.placename" content="Australia" />
        <meta name="format-detection" content="telephone=yes" />
      </head>
      <body className="min-h-screen bg-neutral-50">
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
        <AnalyticsProvider
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
        />
      </body>
    </html>
  );
}
