'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center">
          <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-red-500" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Something went wrong</h2>
          <p className="text-neutral-600 mb-8">
            Sorry about this. Something unexpected went wrong.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
            </div>
          )}

          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
