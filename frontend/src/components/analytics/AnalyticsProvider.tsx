'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Australian Privacy Act 1988 compliance
// Consent mode v2: default to denied until user accepts
type ConsentState = {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
};

const DEFAULT_CONSENT: ConsentState = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

interface AnalyticsProviderProps {
  gaId?: string; // e.g., 'G-XXXXXXXXXX'
  gtmId?: string; // e.g., 'GTM-XXXXXXX'
}

export function AnalyticsProvider({ gaId, gtmId }: AnalyticsProviderProps) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [showConsentBanner, setShowConsentBanner] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const storedConsent = localStorage.getItem('cookie-consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setConsent(prev => ({ ...prev, ...parsed }));
      } catch {
        setShowConsentBanner(true);
      }
    } else {
      setShowConsentBanner(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', consent);
    }
  }, [consent]);

  const acceptAll = () => {
    const granted: ConsentState = {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    };
    setConsent(granted);
    localStorage.setItem('cookie-consent', JSON.stringify(granted));
    setShowConsentBanner(false);
  };

  const acceptEssential = () => {
    setConsent(DEFAULT_CONSENT);
    localStorage.setItem('cookie-consent', JSON.stringify(DEFAULT_CONSENT));
    setShowConsentBanner(false);
  };

  if (!gaId && !gtmId) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}

      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  'anonymize_ip': true,
                  'country': 'AU',
                  'currency': 'AUD',
                });
                // Default consent - denied until user accepts
                gtag('consent', 'default', {
                  'analytics_storage': 'denied',
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                });
              `,
            }}
          />
        </>
      )}

      {/* Consent Banner - AU Privacy Act compliant */}
      {showConsentBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg p-4 sm:p-6"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">
                We respect your privacy
              </h3>
              <p className="text-sm text-neutral-600 max-w-2xl">
                We use cookies to improve your experience and analyse site traffic.
                By clicking "Accept all", you consent to our use of cookies in accordance
                with the Australian Privacy Act 1988.{' '}
                <a href="/privacy" className="text-primary-600 underline">
                  Privacy Policy
                </a>
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={acceptEssential}
                className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Essential only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GTM noscript fallback */}
      {gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}
    </>
  );
}

// Utility: Track events (safe to call even if GA not configured)
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}

// Predefined conversion events for the cleaning service funnel
export const trackConversion = {
  bookingStarted: (serviceType?: string) =>
    trackEvent('booking_started', { service_type: serviceType, currency: 'AUD' }),

  bookingCompleted: (bookingId: string, value: number, serviceType?: string) =>
    trackEvent('booking_completed', {
      transaction_id: bookingId,
      value,
      currency: 'AUD',
      service_type: serviceType,
    }),

  calculatorUsed: (inputType: string) =>
    trackEvent('calculator_interaction', { input_type: inputType }),

  faqExpanded: (questionId: string) =>
    trackEvent('faq_expand', { question_id: questionId }),

  consentGiven: (categories: string[]) =>
    trackEvent('consent_given', { categories: categories.join(',') }),

  consentWithdrawn: (categories: string[]) =>
    trackEvent('consent_withdrawn', { categories: categories.join(',') }),
};
