import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center">
          <FileQuestion className="w-20 h-20 mx-auto mb-6 text-neutral-400" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Page Not Found</h2>
          <p className="text-neutral-600 mb-8">
            This page does not exist or has been moved.
          </p>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
