'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Download,
  RotateCcw,
  Phone,
  Mail,
  Home,
  User,
  DollarSign,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SERVICES: Record<string, string> = {
  standard: 'Standard Cleaning',
  deep: 'Deep Cleaning',
  'end-of-lease': 'End of Lease Cleaning',
  office: 'Office Cleaning',
  carpet: 'Carpet Cleaning',
  window: 'Window Cleaning',
  'pressure-washing': 'Pressure Washing',
  garden: 'Garden Maintenance',
  'pest-control': 'Pest Control',
  upholstery: 'Upholstery Cleaning',
  'builders-clean': 'Builders Clean',
};

const NEXT_STEPS = [
  {
    title: 'Your booking is confirmed',
    description: 'We have created your booking',
    icon: CheckCircle,
    status: 'completed',
    time: 'Immediately',
  },
  {
    title: 'Cleaner Assigned',
    description: 'We will match you with a cleaner',
    icon: User,
    status: 'in-progress',
    time: 'Within 2 hours',
  },
  {
    title: 'Confirmation Call',
    description: 'We will call to confirm the details',
    icon: Phone,
    status: 'pending',
    time: '24 hours before',
  },
  {
    title: 'Cleaning Day',
    description: 'Your cleaner arrives at the scheduled time',
    icon: Home,
    status: 'pending',
    time: 'Scheduled time',
  },
];

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID found');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/v1/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleDownloadReceipt = () => {
    if (!booking) return;

    const receiptContent = `
CLEANPRO RECEIPT
================================
Booking ID: ${bookingId}
Date: ${new Date().toLocaleDateString('en-AU')}

SERVICE: ${SERVICES[booking?.service || ''] || booking?.service}
Address: ${booking?.address}, ${booking?.suburb}
Date: ${booking?.date}
Time: ${booking?.timeSlot}

${booking?.addons?.length ? 'ADD-ONS:\n' + booking.addons.map((a: string) => `- ${a}`).join('\n') : ''}

TOTAL PAID: $${booking?.totalPrice || 0}
Payment Status: Paid
Payment Method: Card (Stripe)
================================
Thanks for booking with CleanPro
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = () => {
    if (!booking) return;

    const startDate = booking?.date || '';
    const startTime = booking?.timeSlot?.replace(':', '') || '0800';
    const title = encodeURIComponent(`CleanPro - ${SERVICES[booking?.service || ''] || booking?.service}`);
    const location = encodeURIComponent(`${booking?.address}, ${booking?.suburb}`);
    const details = encodeURIComponent(`Cleaning service booking #${bookingId}`);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}T${startTime}00/${startDate}T${startTime}00&location=${location}&details=${details}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'We could not find the booking'}</p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Book Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
                />
              </svg>
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your booking is confirmed</h1>
          <p className="text-gray-600">Your cleaning is booked</p>
        </motion.div>

        {/* Booking ID */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 text-center">
          <span className="text-sm text-gray-500">Booking ID</span>
          <p className="text-xl font-mono font-bold text-blue-600">{bookingId}</p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-500">Service</span>
                <p className="font-semibold text-lg">{SERVICES[booking?.service] || booking?.service}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-500">Date & Time</span>
                <p className="font-semibold text-lg">
                  {booking?.date ? new Date(booking.date).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </p>
                <p className="text-gray-600">{booking?.timeSlot}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-500">Address</span>
                <p className="font-semibold">{booking?.address}</p>
                <p className="text-gray-600">{booking?.suburb}</p>
              </div>
            </div>

            {booking?.bedrooms && (
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-500">Property Details</span>
                  <p className="font-semibold">{booking?.bedrooms} Bedroom{booking?.bedrooms > 1 ? 's' : ''}, {booking?.bathrooms} Bathroom{booking?.bathrooms > 1 ? 's' : ''}</p>
                  <p className="text-gray-600">{booking?.propertyType}</p>
                </div>
              </div>
            )}

            {booking?.addons?.length > 0 && (
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-500">Add-ons</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {booking.addons.map((addon: string) => (
                      <span key={addon} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {addon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-500">Total Price</span>
                <p className="font-bold text-2xl text-green-600">${booking?.totalPrice || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Payment Status</h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">
                  {booking?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-gray-500">Payment processed via Stripe</p>
            </div>
          </div>
        </div>

        {/* Next Steps Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">What Happens Next</h2>
          <div className="space-y-6">
            {NEXT_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : step.status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < NEXT_STEPS.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    <span className="text-sm text-gray-400 mt-1 inline-block">{step.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <Calendar className="w-5 h-5" />
            Add to Calendar
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">Our team is here to help</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:1300CLEAN" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Phone className="w-4 h-4" />
              1300 CLEAN
            </a>
            <a href="mailto:support@cleanpro.com.au" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Mail className="w-4 h-4" />
              support@cleanpro.com.au
            </a>
          </div>
        </div>

        {/* Book Again CTA */}
        <div className="text-center">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Book Another Service
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
