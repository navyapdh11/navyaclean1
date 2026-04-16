'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Basic Clean',
    price: 120,
    description: 'For regular cleaning',
    features: [
      'Kitchen cleaning',
      'Bathroom sanitization',
      'Living areas vacuuming',
      'Dusting all surfaces',
      'Floor mopping',
    ],
    popular: false,
  },
  {
    name: 'Deep Clean',
    price: 250,
    description: 'A thorough clean from top to bottom',
    features: [
      'Everything in Basic',
      'Inside appliance cleaning',
      'Baseboard wiping',
      'Light fixture dusting',
      'Window sill cleaning',
      'Cabinet exterior cleaning',
    ],
    popular: true,
  },
  {
    name: 'Premium Clean',
    price: 450,
    description: 'Our most thorough clean',
    features: [
      'Everything in Deep Clean',
      'Inside oven cleaning',
      'Inside fridge cleaning',
      'Laundry service',
      'Window cleaning (interior)',
      'Carpet spot treatment',
      'Organizing services',
    ],
    popular: false,
  },
];

const addons = [
  { name: 'Oven Clean', price: 30 },
  { name: 'Fridge Clean', price: 25 },
  { name: 'Window Clean', price: 40 },
  { name: 'Laundry', price: 20 },
  { name: 'Carpet Shampoo', price: 80 },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Clear Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-neutral-100 max-w-3xl mx-auto"
          >
            No hidden fees. Pick the plan that fits.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white rounded-2xl p-8 border-2 relative ${
                plan.popular ? 'border-primary-600 shadow-xl' : 'border-neutral-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
              <p className="text-neutral-600 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-neutral-900">${plan.price}</span>
                <span className="text-neutral-600 ml-2">/session</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push(`/book?plan=${plan.name.toLowerCase().replace(' ', '-')}`)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                }`}
              >
                Book Now
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-neutral-900 mb-8 text-center">Add-ons</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
              >
                <span className="text-neutral-900 font-medium">{addon.name}</span>
                <span className="text-primary-600 font-bold">+${addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
