'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Clock, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { TrustBadges, BondBackGuarantee, GSTDisclosure } from '@/components/compliance/TrustBadges';

const features = [
  { icon: Sparkles, title: 'Quality Cleaning', description: 'Trained staff and eco-friendly products for consistent results.' },
  { icon: Shield, title: 'Insured & Bonded', description: 'Every service covered by full insurance.' },
  { icon: Clock, title: 'Flexible Scheduling', description: 'Book online any time, with same-day service available.' },
  { icon: Star, title: 'Top Rated', description: 'Over 10,000 bookings and a 4.9-star average.' },
];

const services = [
  { name: 'Regular Cleaning', slug: 'regular-cleaning', price: 'From $120', desc: 'Standard cleaning service for homes and apartments' },
  { name: 'Deep Cleaning', slug: 'deep-cleaning', price: 'From $250', desc: 'Intensive cleaning for a thorough fresh start' },
  { name: 'Commercial Cleaning', slug: 'commercial-cleaning', price: 'From $200', desc: 'Professional cleaning for offices and commercial spaces' },
  { name: 'End of Lease Cleaning', slug: 'end-of-lease', price: 'From $350', desc: 'Bond-back guaranteed cleaning for tenants' },
  { name: 'Carpet Cleaning', slug: 'carpet-cleaning', price: 'From $150', desc: 'Professional steam carpet cleaning' },
  { name: 'Window Cleaning', slug: 'window-cleaning', price: 'From $100', desc: 'Interior and exterior window cleaning' },
  { name: 'Pressure Washing', slug: 'pressure-washing', price: 'From $200', desc: 'Outdoor surface cleaning and restoration' },
  { name: 'Tile & Grout Cleaning', slug: 'tile-grout-cleaning', price: 'From $180', desc: 'Deep cleaning for tile and grout restoration' },
  { name: 'Machine Scrubbing', slug: 'machine-scrubbing', price: 'From $160', desc: 'Industrial floor scrubbing and cleaning' },
  { name: 'Polishing', slug: 'polishing', price: 'From $140', desc: 'Floor and surface polishing services' },
  { name: 'Sealing', slug: 'sealing', price: 'From $150', desc: 'Protective sealing for various surfaces' },
  { name: 'Custom Cleaning', slug: 'custom-cleaning', price: 'Custom Quote', desc: 'Tailored cleaning solutions for unique needs' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url(/grid.svg)] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Cleaning Services<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">for Homes and Businesses</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl">
              Book a cleaner in seconds. Reliable teams, fair pricing, and a results you can see.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/services" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3">
                View Services
              </Link>
            </div>
            <div className="mt-8">
              <TrustBadges compact />
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50" />
      </section>

      {/* Features */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Customers Pick CleanPro</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">We pair trained staff with good products so you get a clean that lasts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card hover:shadow-lg transition-all duration-300">
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-neutral-600 text-lg">Cleaning solutions for homes, offices, and specialised jobs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div key={service.slug} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="card hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <Link href={`/services/${service.slug}`} className="block">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">{service.name}</h3>
                  <p className="text-neutral-600 mb-4">{service.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-bold">{service.price}</span>
                    <span className="btn-primary text-sm group-hover:bg-primary-700 transition-colors">Learn More</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Customer Reviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', text: 'My apartment looked better than when I moved in. Great team.', rating: 5 },
              { name: 'James L.', text: 'They showed up on time and did a thorough job. I would use them again.', rating: 5 },
              { name: 'Emily R.', text: 'Booking online was straightforward. The cleaners were great.', rating: 5 },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
                <div className="flex gap-1 mb-4">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-neutral-700 mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Book Your First Clean Today</h2>
          <p className="text-xl text-neutral-300 mb-8">Get a cleaner at your door this week. Your first booking includes a free quote.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn bg-primary-600 hover:bg-primary-700 text-lg px-8 py-3">Create Account</Link>
            <Link href="/contact" className="btn border-2 border-neutral-600 hover:border-white text-lg px-8 py-3">Get in Touch</Link>
          </div>
          <div className="flex flex-wrap gap-6 justify-center mt-8 text-neutral-400">
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> No card needed to sign up</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Cancel or reschedule anytime</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Not happy? We will re-clean for free</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
