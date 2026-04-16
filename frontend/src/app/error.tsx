'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Bug, ClipboardCopy } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const errorContext = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      digest: error.digest,
    };

    console.error('[GlobalError]', errorContext);

    // Send to error monitoring service if configured
    if (typeof window !== 'undefined' && (window as any).__errorReporting) {
      (window as any).__errorReporting.captureException(error, errorContext);
    }
  }, [error]);

  const handleCopyError = useCallback(() => {
    const errorInfo = [
      `Error: ${error.name}`,
      `Message: ${error.message}`,
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      error.stack ? `\nStack:\n${error.stack}` : '',
    ].join('\n');

    navigator.clipboard.writeText(errorInfo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [error]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/20 to-neutral-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-600 mb-6">
              We apologize for the inconvenience. An unexpected error occurred.
              Our team has been notified and is working to fix it.
            </p>

            {isDevelopment && (
              <motion.details
                initial={false}
                className="mb-6 group"
              >
                <summary className="flex items-center gap-2 text-sm font-medium text-red-600 cursor-pointer hover:text-red-700 transition-colors">
                  <Bug className="w-4 h-4" />
                  View error details (development)
                </summary>
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-mono text-red-800 break-all mb-2">
                    <span className="font-semibold">{error.name}:</span> {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs font-mono text-red-600">
                      Digest: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <pre className="mt-2 text-xs font-mono text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </motion.details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={handleCopyError}
                disabled={copied}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
                aria-label="Copy error details"
              >
                <ClipboardCopy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 text-center">
              Error occurred on:{' '}
              <code className="font-mono bg-neutral-200 px-1.5 py-0.5 rounded">
                {window.location?.pathname ?? 'unknown'}
              </code>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
