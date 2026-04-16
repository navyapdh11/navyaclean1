'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CreditCard,
  Clock,
  MapPin,
  Home,
  Building,
  Sparkles,
  Droplets,
  Wind,
  Trash2,
  TreePine,
  Sofa,
  Shield,
  Plus,
  Minus,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SERVICES = [
  { id: 'standard', name: 'Standard Cleaning', price: 120, icon: Sparkles, description: 'Regular home cleaning' },
  { id: 'deep', name: 'Deep Cleaning', price: 250, icon: Droplets, description: 'Intensive deep clean' },
  { id: 'end-of-lease', name: 'End of Lease Cleaning', price: 350, icon: Home, description: 'Bond-back guaranteed' },
  { id: 'office', name: 'Office Cleaning', price: 200, icon: Building, description: 'Commercial spaces' },
  { id: 'carpet', name: 'Carpet Cleaning', price: 150, icon: Wind, description: 'Steam carpet cleaning' },
  { id: 'window', name: 'Window Cleaning', price: 100, icon: Droplets, description: 'Interior & exterior' },
  { id: 'pressure-washing', name: 'Pressure Washing', price: 200, icon: Droplets, description: 'Outdoor surfaces' },
  { id: 'garden', name: 'Garden Maintenance', price: 120, icon: TreePine, description: 'Lawn & garden care' },
  { id: 'pest-control', name: 'Pest Control', price: 180, icon: Trash2, description: 'Pest elimination' },
  { id: 'upholstery', name: 'Upholstery Cleaning', price: 140, icon: Sofa, description: 'Furniture cleaning' },
  { id: 'builders-clean', name: 'Builders Clean', price: 400, icon: Shield, description: 'Post-construction clean' },
];

const ADDONS = [
  { id: 'oven', name: 'Oven Clean', price: 30 },
  { id: 'fridge', name: 'Fridge Clean', price: 25 },
  { id: 'windows', name: 'Window Clean', price: 40 },
  { id: 'laundry', name: 'Laundry', price: 20 },
];

const PROPERTY_TYPES = ['Apartment', 'House', 'Townhouse', 'Unit', 'Villa', 'Studio'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const bookingSchema = z.object({
  service: z.string().min(1, 'Please select a service'),
  bedrooms: z.coerce.number().min(1).max(10),
  bathrooms: z.coerce.number().min(1).max(8),
  propertyType: z.string().min(1, 'Please select property type'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  suburb: z.string().min(2, 'Suburb is required'),
  date: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  addons: z.array(z.string()).default([]),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone number required'),
});

type BookingForm = z.infer<typeof bookingSchema>;

const stepVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const totalSteps = 5;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: '',
      bedrooms: 1,
      bathrooms: 1,
      propertyType: '',
      address: '',
      suburb: '',
      date: '',
      timeSlot: '',
      addons: [],
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const selectedService = watch('service');
  const bedrooms = watch('bedrooms');
  const bathrooms = watch('bathrooms');
  const selectedAddons = watch('addons');

  const calculatePrice = () => {
    const service = SERVICES.find((s) => s.id === selectedService);
    if (!service) return 0;

    let base = service.price;
    base += (bedrooms - 1) * 25;
    base += ((watch('bathrooms') || 1) - 1) * 20;

    const addonsTotal = ADDONS.filter((a) => selectedAddons?.includes(a.id)).reduce(
      (sum, a) => sum + a.price,
      0
    );

    return base + addonsTotal;
  };

  const toggleAddon = (addonId: string) => {
    const current = selectedAddons || [];
    const updated = current.includes(addonId)
      ? current.filter((id) => id !== addonId)
      : [...current, addonId];
    setValue('addons', updated);
  };

  const validateStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof BookingForm)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['service'];
        break;
      case 2:
        fieldsToValidate = ['bedrooms', 'bathrooms', 'propertyType', 'address', 'suburb'];
        break;
      case 3:
        fieldsToValidate = ['date', 'timeSlot'];
        break;
      case 4:
        return true;
      case 5:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
        break;
    }

    const valid = await Promise.all(
      fieldsToValidate.map(async (field) => {
        const result = await trigger(field);
        return result;
      })
    );

    return valid.every(Boolean);
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: BookingForm) => {
    setIsSubmitting(true);
    setStripeError(null);

    try {
      // Step 1: Create booking first via API
      const { bookingsApi, paymentsApi } = await import('@/lib/api');
      
      const bookingResponse = await bookingsApi.create({
        serviceId: data.service,
        date: `${data.date}T${data.timeSlot}:00`,
        address: `${data.address}, ${data.suburb}`,
        notes: `Bedrooms: ${data.bedrooms}, Bathrooms: ${data.bathrooms}, Property: ${data.propertyType}`,
      });

      const booking = bookingResponse.data.data;
      const bookingId = booking.id;

      // Step 2: Create payment intent with bookingId
      const paymentResponse = await paymentsApi.createIntent({ bookingId });
      const { clientSecret, paymentIntentId } = paymentResponse.data.data;

      // Step 3: Confirm payment with Stripe
      const stripe = await import('@stripe/stripe-js').then((m) => m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));
      if (!stripe) throw new Error('Stripe failed to load');

      const elements = stripe.elements({ clientSecret });
      const card = elements.getElement('card');

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement || undefined },
      });

      if (stripeError) {
        setStripeError(stripeError.message || 'Payment failed');
        setIsSubmitting(false);
        return;
      }

      // Payment successful, redirect to confirmation
      router.push(`/confirmation?bookingId=${bookingId}&paymentIntentId=${paymentIntentId}`);
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Service</span>
            <span>Details</span>
            <span>Date</span>
            <span>Extras</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Price Summary - Always visible */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 sticky top-4 z-10">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">
              {SERVICES.find((s) => s.id === selectedService)?.name || 'Select a service'}
            </span>
            <span className="text-2xl font-bold text-blue-600">${calculatePrice()}</span>
          </div>
        </div>

        {/* Form Steps */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Select Service */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setValue('service', service.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedService === service.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${selectedService === service.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.description}</p>
                            <p className="text-lg font-bold text-blue-600 mt-1">${service.price}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.service && <p className="text-red-500 mt-2">{errors.service.message}</p>}
              </motion.div>
            )}

            {/* Step 2: Property Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <Controller
                      name="bedrooms"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.max(1, field.value - 1))}
                            className="p-2 rounded-lg border hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            {...field}
                            className="w-20 text-center p-2 border rounded-lg"
                            min={1}
                            max={10}
                          />
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.min(10, field.value + 1))}
                            className="p-2 rounded-lg border hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    />
                    {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <Controller
                      name="bathrooms"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.max(1, field.value - 1))}
                            className="p-2 rounded-lg border hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            {...field}
                            className="w-20 text-center p-2 border rounded-lg"
                            min={1}
                            max={8}
                          />
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.min(8, field.value + 1))}
                            className="p-2 rounded-lg border hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    />
                    {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <Controller
                      name="propertyType"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="w-full p-3 border rounded-lg">
                          <option value="">Select type</option>
                          {PROPERTY_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suburb</label>
                    <Controller
                      name="suburb"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="w-full p-3 border rounded-lg" placeholder="e.g., Bondi" />
                      )}
                    />
                    {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="w-full p-3 border rounded-lg" placeholder="123 Main Street" />
                      )}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Date/Time Picker */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Date
                    </label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          {...field}
                          min={today}
                          className="w-full p-3 border rounded-lg"
                        />
                      )}
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setValue('timeSlot', slot)}
                          className={`p-2 rounded-lg border text-sm transition-all ${
                            watch('timeSlot') === slot
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'hover:border-blue-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Add-ons */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add-ons</h2>
                <p className="text-gray-600 mb-6">Add extras to your cleaning service</p>
                <div className="space-y-4">
                  {ADDONS.map((addon) => {
                    const isSelected = selectedAddons?.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className="font-medium">{addon.name}</span>
                        </div>
                        <span className="font-bold text-blue-600">+${addon.price}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 5: Payment & Contact */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="w-full p-3 border rounded-lg" placeholder="John" />
                      )}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="w-full p-3 border rounded-lg" placeholder="Smith" />
                      )}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <input {...field} type="email" className="w-full p-3 border rounded-lg" placeholder="john@example.com" />
                      )}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <input {...field} type="tel" className="w-full p-3 border rounded-lg" placeholder="04XX XXX XXX" />
                      )}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* Stripe Card Element placeholder */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold">Pay by Card</h3>
                  </div>
                  <div id="card-element" className="p-4 bg-white border rounded-lg">
                    {/* Stripe Elements will mount here */}
                    <p className="text-gray-400 text-sm">Card details will be securely collected via Stripe</p>
                  </div>
                  {stripeError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {stripeError}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{SERVICES.find((s) => s.id === selectedService)?.name}</span>
                      <span>${SERVICES.find((s) => s.id === selectedService)?.price}</span>
                    </div>
                    {bedrooms > 1 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Extra bedrooms ({bedrooms - 1} x $25)</span>
                        <span>${(bedrooms - 1) * 25}</span>
                      </div>
                    )}
                    {selectedAddons?.map((addonId) => {
                      const addon = ADDONS.find((a) => a.id === addonId);
                      return addon ? (
                        <div key={addonId} className="flex justify-between text-gray-500">
                          <span>{addon.name}</span>
                          <span>+${addon.price}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">${calculatePrice()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'opacity-50 cursor-not-allowed bg-gray-200'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ${calculatePrice()}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
