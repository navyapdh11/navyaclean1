'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { RefreshCw, Home, Clock, DollarSign, CheckCircle, Star, Shield, ArrowRight, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const features = [
  { icon: Shield, title: 'Quality You Can Count On', description: 'Trained cleaners follow a checklist every visit.' },
  { icon: RefreshCw, title: 'Book When It Works', description: 'Weekly, fortnightly, or monthly. You choose.' },
  { icon: Clock, title: 'On Time, Every Time', description: '2-4 hours per session depending on home size.' },
  { icon: Star, title: 'Same Cleaner Each Visit', description: 'A dedicated cleaner who learns your home and preferences.' },
];

const pricingPlans = [
  { name: 'Weekly', price: '$129', perVisit: '/visit', duration: '2-3 hours', features: ['Kitchen & bathroom clean', 'Dusting all surfaces', 'Floors vacuumed & mopped', 'Kitchen bench wiped', 'Bins emptied'] },
  { name: 'Fortnightly', price: '$139', perVisit: '/visit', duration: '2-4 hours', features: ['Everything in Weekly plan', 'Inside appliance wipe-down', 'Window sills cleaned', 'Light fixture dusting', 'Skirting boards wiped'] },
  { name: 'Monthly', price: '$159', perVisit: '/visit', duration: '3-4 hours', features: ['Everything in Fortnightly plan', 'Inside cupboards cleaned', 'Wall spot-cleaning', 'Blinds dusted', 'Deeper bathroom scrub'] },
];

const faqs = [
  { q: 'How often should I schedule regular cleaning?', a: 'It depends on your lifestyle and household size. Weekly is ideal for busy families or homes with pets. Fortnightly works well for most households. Monthly is great for smaller apartments or those who do some cleaning themselves between visits.' },
  { q: 'Will the same cleaner come each time?', a: 'Yes, we assign a dedicated cleaner to your home whenever possible. This means they learn your preferences, know which areas need extra attention, and can work more efficiently. If your regular cleaner is unavailable, we will send an equally qualified team member.' },
  { q: 'Do I need to provide cleaning supplies?', a: 'No, our cleaners bring all necessary eco-friendly cleaning products and equipment. If you prefer us to use specific products you have at home, just let us know when you book.' },
  { q: 'Can I customise what gets cleaned each visit?', a: 'Absolutely. While we follow a standard checklist to ensure consistency, you can add or remove tasks from your regular clean. Just communicate your preferences when booking or to your assigned cleaner directly.' },
];

const testimonials = [
  { name: 'Amanda K.', location: 'Sydney NSW', text: 'Maria comes every fortnight and knows exactly what I like. The house always looks great when I get home.', rating: 5 },
  { name: 'David L.', location: 'Perth WA', text: 'Switched from a casual cleaner to CleanPro. The quality is much better and they are always on time.', rating: 5 },
  { name: 'Sophie W.', location: 'Adelaide SA', text: 'I can reschedule online with one click. The cleaning is consistently good.', rating: 5 },
];

const galleryItems = [
  { label: 'Kitchen Before' },
  { label: 'Kitchen After' },
  { label: 'Bathroom Before' },
  { label: 'Bathroom After' },
  { label: 'Living Room Before' },
  { label: 'Living Room After' },
];

export default function RegularCleaningPage() {
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
                <RefreshCw className="w-8 h-8" />
              </div>
              <span className="text-primary-200 text-sm font-semibold uppercase tracking-wider">Regular House Cleaning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              A Cleaner Home,<br />On Repeat
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl">
              Regular cleaning on your schedule. Same trusted cleaner every visit. Starting from $129 per session.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book?service=regular-cleaning" className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3">
                Book Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#pricing" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3">
                View Pricing
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 text-primary-200 text-sm">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 2-4 hours</span>
              <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> From $129</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Satisfaction guaranteed</span>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50" />
      </section>

      {/* Features */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Regular Cleaning Works</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">Consistent cleaning prevents buildup, saves you time, and keeps your home feeling fresh every day.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Every Visit Includes</h2>
            <p className="text-neutral-600 text-lg">A thorough clean of all your living spaces, every single time</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { room: 'Kitchen', items: ['Benchtops & splashbacks wiped', 'Stovetop cleaned', 'Sink polished', 'Exterior of appliances wiped', 'Floor swept & mopped', 'Bins emptied & liner replaced'] },
              { room: 'Bathroom', items: ['Toilet sanitised', 'Shower & tub scrubbed', 'Vanity & mirror cleaned', 'Tiles wiped down', 'Floor mopped', 'Towels changed (if requested)'] },
              { room: 'Living Areas', items: ['All surfaces dusted', 'Furniture vacuumed (upholstery)', 'Floors vacuumed & mopped', 'Light switches & handles wiped', 'Skirting boards spot-cleaned', 'Cobwebs removed'] },
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Flexible Plans</h2>
            <p className="text-neutral-600 text-lg">Choose the frequency that works for you. All prices per visit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`card ${i === 1 ? 'border-primary-400 ring-2 ring-primary-200' : 'hover:shadow-lg'} transition-all`}>
                {i === 1 && <span className="inline-block bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">Best Value</span>}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                  <span className="text-neutral-500">{plan.perVisit}</span>
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
                <Link href="/book?service=regular-cleaning" className="btn-primary w-full text-center">
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
            <p className="text-neutral-600 text-lg">Consistent cleaning means a consistently beautiful home</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Come Home to a Spotless House</h2>
          <p className="text-xl text-neutral-300 mb-8">Set up regular cleaning and never worry about housework again.</p>
          <Link href="/book?service=regular-cleaning" className="btn bg-primary-600 hover:bg-primary-700 text-lg px-10 py-4 inline-flex">
            Book Regular Cleaning <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <div className="flex flex-wrap gap-6 justify-center mt-8 text-neutral-400">
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Same cleaner each visit</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Flexible scheduling</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Eco-friendly products</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
