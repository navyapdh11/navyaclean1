'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Bug, ClipboardCopy, Lock } from 'lucide-react';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
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
      section: 'admin',
    };

    console.error('[AdminError]', errorContext);

    // Send to error monitoring service if configured
    if (typeof window !== 'undefined' && (window as any).__errorReporting) {
      (window as any).__errorReporting.captureException(error, errorContext);
    }
  }, [error]);

  const handleCopyError = useCallback(() => {
    const errorInfo = [
      `[ADMIN ERROR] ${error.name}`,
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
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
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
            <div className="relative bg-gray-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-12 h-12 text-amber-400" />
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Admin header */}
          <div className="bg-gray-900 px-8 py-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Admin Panel Error</h2>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin dashboard encountered an error
            </h1>
            <p className="text-gray-600 mb-6">
              The admin panel experienced an unexpected error. Your session remains secure.
              Please try again or contact your system administrator if the issue persists.
            </p>

            {isDevelopment && (
              <motion.details
                initial={false}
                className="mb-6 group"
              >
                <summary className="flex items-center gap-2 text-sm font-medium text-amber-600 cursor-pointer hover:text-amber-700 transition-colors">
                  <Bug className="w-4 h-4" />
                  View error details (development)
                </summary>
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-mono text-amber-800 break-all mb-2">
                    <span className="font-semibold">{error.name}:</span> {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs font-mono text-amber-600">
                      Digest: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <pre className="mt-2 text-xs font-mono text-amber-700 whitespace-pre-wrap overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </motion.details>
            )}

            {/* Error context info */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Context</h3>
              <dl className="space-y-1 text-xs font-mono text-gray-600">
                <div className="flex justify-between">
                  <dt>Path:</dt>
                  <dd className="text-gray-800">{window.location?.pathname ?? 'unknown'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Time:</dt>
                  <dd className="text-gray-800">{new Date().toLocaleTimeString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Error ID:</dt>
                  <dd className="text-gray-800">{error.digest ?? 'N/A'}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Admin Panel
              </button>

              <button
                onClick={handleCopyError}
                disabled={copied}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Copy error details"
              >
                <ClipboardCopy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              If this error persists, contact the system administrator with the error details above.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
