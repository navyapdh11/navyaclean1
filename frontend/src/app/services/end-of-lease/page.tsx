'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Sparkles, Home, Clock, DollarSign, CheckCircle, Star, Shield, ArrowRight, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const features = [
  { icon: Shield, title: 'Bond-Back Guarantee', description: 'If your agent is not satisfied, we re-clean at no cost.' },
  { icon: Sparkles, title: 'Every Surface Covered', description: 'Inside cupboards, behind appliances, and all areas on your exit checklist.' },
  { icon: Clock, title: 'Fast Turnaround', description: '3-6 hours. Same-day and next-day slots available.' },
  { icon: Star, title: 'Trained Professionals', description: 'Background-checked cleaners experienced in end-of-lease requirements.' },
];

const pricingPlans = [
  { name: 'Studio / 1 Bedroom', price: '$189', duration: '3-4 hours', features: ['Kitchen deep clean', 'Bathroom sanitisation', 'All floors vacuumed & mopped', 'Windows (interior)', 'Cupboards inside & out'] },
  { name: '2-3 Bedroom', price: '$289', duration: '4-5 hours', features: ['Everything in Studio plan', 'Additional bedrooms', 'Laundry cleaning', 'Wardrobe interiors', 'Balcony sweep (if applicable)'] },
  { name: '4+ Bedroom', price: '$389', duration: '5-6 hours', features: ['Everything in 2-3 Bed plan', 'Extra bedrooms & bathrooms', 'Garage sweep', 'Outdoor area cleaning', 'Priority scheduling'] },
];

const faqs = [
  { q: 'What does end-of-lease cleaning include?', a: 'Our end-of-lease (bond) cleaning covers every area of the property: kitchen (inside cupboards, oven, stovetop, rangehood), all bathrooms (tiles, shower, toilet, vanity), bedrooms and living areas (walls, skirting boards, windowsills), floors (vacuumed and mopped), windows (interior), and laundry. We follow the standard real estate exit cleaning checklist.' },
  { q: 'Do you guarantee the bond will be returned?', a: 'Yes. We offer a bond-back guarantee. If your real estate agent or landlord identifies any cleaning issues, we will return and re-clean those areas within 48 hours at no additional charge. This gives you complete peace of mind.' },
  { q: 'How much notice do you need to book?', a: 'We recommend booking at least 3-5 days before your inspection. However, we do offer same-day and next-day service when available, subject to our schedule. Book online or call us for urgent requests.' },
  { q: 'Do I need to be home during the cleaning?', a: 'No, you do not need to be present. Many of our clients arrange key drop-off or provide access via a lockbox. We will secure the property when we finish and can notify you via SMS when the job is complete.' },
];

const testimonials = [
  { name: 'Jessica T.', location: 'Melbourne VIC', text: 'Got my full bond back. They cleaned areas I had not even thought about.', rating: 5 },
  { name: 'Michael R.', location: 'Sydney NSW', text: 'The bond-back guarantee gave me confidence. They delivered and the agent was happy.', rating: 5 },
  { name: 'Priya S.', location: 'Brisbane QLD', text: 'Booked last minute and they came the next day. The apartment looked great.', rating: 5 },
];

const galleryItems = [
  { label: 'Kitchen Before' },
  { label: 'Kitchen After' },
  { label: 'Bathroom Before' },
  { label: 'Bathroom After' },
  { label: 'Living Room Before' },
  { label: 'Living Room After' },
];

export default function EndOfLeasePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url(/grid.svg)] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8" />
              </div>
              <span className="text-primary-200 text-sm font-semibold uppercase tracking-wider">End of Lease Cleaning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bond Cleaning You<br />Can Trust
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl">
              Get your full bond back with our thorough end-of-lease cleaning. Bond-back guarantee included. Starting from $189.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book?service=end-of-lease" className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3">
                Book Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#pricing" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3">
                View Pricing
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 text-primary-200 text-sm">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 3-6 hours</span>
              <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> From $189</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Bond-back guarantee</span>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50" />
      </section>

      {/* Features */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Bond Cleaning?</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">We understand what real estate agents look for during exit inspections. Our process is designed to exceed their expectations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card hover:shadow-lg transition-all duration-300">
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Is Included</h2>
            <p className="text-neutral-600 text-lg">Every area of your property, cleaned to the highest standard</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { room: 'Kitchen', items: ['Inside & outside of all cupboards', 'Oven & stovetop deep clean', 'Rangehood filter cleaning', 'Benchtops & splashbacks', 'Sink polished & sanitised', 'Floor swept & mopped'] },
              { room: 'Bathroom', items: ['All tiles scrubbed & regrouted', 'Shower screen descaled', 'Toilet sanitised inside & out', 'Vanity & mirror polished', 'Exhaust fan dusted', 'Floor washed'] },
              { room: 'Living & Bedrooms', items: ['All surfaces dusted', 'Skirting boards wiped', 'Window sills & tracks cleaned', 'Wardrobe interiors vacuumed', 'Light switches & door handles', 'Floor vacuumed & mopped'] },
            ].map((room, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card">
                <h3 className="text-xl font-semibold mb-4 text-primary-600">{room.room}</h3>
                <ul className="space-y-3">
                  {room.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-neutral-600 text-lg">No hidden fees. Choose the plan that matches your property.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`card ${i === 1 ? 'border-primary-400 ring-2 ring-primary-200' : 'hover:shadow-lg'} transition-all`}>
                {i === 1 && <span className="inline-block bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">Most Popular</span>}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                </div>
                <p className="text-neutral-500 text-sm mb-6 flex items-center gap-1"><Clock className="w-4 h-4" /> {plan.duration}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-neutral-700 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/book?service=end-of-lease" className="btn-primary w-full text-center">
                  Book Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See the Difference</h2>
            <p className="text-neutral-600 text-lg">Real results from our end-of-lease cleaning jobs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {galleryItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card flex flex-col items-center justify-center min-h-[200px] bg-neutral-100">
                <ImageIcon className="w-12 h-12 text-neutral-400 mb-3" />
                <span className="text-neutral-500 font-medium">{item.label}</span>
                <span className="text-neutral-400 text-sm mt-1">Gallery image placeholder</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-neutral-700 mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-neutral-500 text-sm">{t.location}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full text-left">
                  <span className="text-lg font-semibold pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-primary-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-neutral-600 mt-4 leading-relaxed">
                    {faq.a}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Bond Back?</h2>
          <p className="text-xl text-neutral-300 mb-8">Book your end-of-lease cleaning today. Bond-back guarantee included with every service.</p>
          <Link href="/book?service=end-of-lease" className="btn bg-primary-600 hover:bg-primary-700 text-lg px-10 py-4 inline-flex">
            Book End of Lease Clean <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <div className="flex flex-wrap gap-6 justify-center mt-8 text-neutral-400">
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Bond-back guarantee</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> No lock-in contracts</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Eco-friendly products</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
