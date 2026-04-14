'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { servicesApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Sparkles, Droplets, Home, Building, Wind, Hammer, Shield, Zap, PaintBucket, Droplet, Wrench, Star, Clock, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STATIC_SERVICES = [
  {
    id: 'regular',
    name: 'Regular Cleaning',
    slug: 'regular-cleaning',
    icon: Sparkles,
    description: 'Standard cleaning service for homes and apartments. Perfect for ongoing maintenance.',
    longDescription: 'Our Regular Cleaning service covers all essential cleaning tasks including dusting, vacuuming, mopping, kitchen and bathroom sanitization. Ideal for weekly or fortnightly maintenance.',
    duration: 120,
    basePrice: 120,
    features: ['Kitchen & bathroom sanitization', 'Dusting all surfaces', 'Vacuuming & mopping', 'Trash removal', 'Bed making'],
    includes: ['All cleaning supplies', 'Eco-friendly products', 'Trained professionals', 'Satisfaction guarantee'],
    popular: true,
  },
  {
    id: 'end-of-lease',
    name: 'End of Lease Cleaning',
    slug: 'end-of-lease',
    icon: Home,
    description: 'Bond-back guaranteed deep cleaning for tenants moving out.',
    longDescription: 'Comprehensive end-of-lease cleaning that meets real estate standards. We guarantee your bond back or we\'ll re-clean for free.',
    duration: 300,
    basePrice: 350,
    features: ['Complete property clean', 'Inside all cabinets', 'Oven & stove cleaning', 'Window cleaning', 'Carpet steam cleaning', 'Bond-back guarantee'],
    includes: ['Bond-back guarantee', 'Before & after photos', 'Real estate approved', 'Same-day service available'],
    popular: true,
  },
  {
    id: 'commercial',
    name: 'Commercial Cleaning',
    slug: 'commercial-cleaning',
    icon: Building,
    description: 'Professional cleaning for offices, retail spaces, and commercial properties.',
    longDescription: 'Keep your workplace pristine with our commercial cleaning services. We offer flexible scheduling including after-hours and weekend options to minimize disruption.',
    duration: 180,
    basePrice: 200,
    features: ['Office & desk cleaning', 'Restroom sanitization', 'Kitchen/break room', 'Floor care', 'Trash removal', 'Window cleaning'],
    includes: ['Flexible scheduling', 'Insured & bonded', 'Green cleaning options', 'Custom cleaning plans'],
    popular: false,
  },
  {
    id: 'carpet',
    name: 'Carpet Cleaning',
    slug: 'carpet-cleaning',
    icon: Wind,
    description: 'Professional steam cleaning for fresh, hygienic carpets.',
    longDescription: 'Our hot water extraction method removes deep-seated dirt, allergens, and stains. Suitable for all carpet types with quick drying times.',
    duration: 90,
    basePrice: 150,
    features: ['Hot water extraction', 'Stain pre-treatment', 'Deodorizing', 'Quick drying', 'Pet stain removal'],
    includes: ['Pre-inspection', 'Move furniture', 'Spot treatment', 'Grooming pile'],
    popular: false,
  },
  {
    id: 'window',
    name: 'Window Cleaning',
    slug: 'window-cleaning',
    icon: Droplet,
    description: 'Crystal clear windows inside and out for maximum light.',
    longDescription: 'Professional window cleaning for homes and businesses. We clean frames, tracks, and screens for a spotless finish.',
    duration: 60,
    basePrice: 100,
    features: ['Interior & exterior', 'Frame & track cleaning', 'Screen washing', 'Sill wiping', 'Hard water removal'],
    includes: ['All equipment', 'Insurance coverage', 'Streak-free guarantee', 'Multi-story capable'],
    popular: false,
  },
  {
    id: 'pressure-washing',
    name: 'Pressure Washing',
    slug: 'pressure-washing',
    icon: Droplets,
    description: 'High-pressure cleaning for driveways, walls, and outdoor areas.',
    longDescription: 'Restore outdoor surfaces with our industrial-grade pressure washing. Removes mould, algae, grime, and stains from concrete, brick, and timber.',
    duration: 120,
    basePrice: 200,
    features: ['Driveways & paths', 'Walls & fences', 'Decks & patios', 'Gutter cleaning', 'Graffiti removal'],
    includes: ['Industrial equipment', 'Eco-safe detergents', 'Surface assessment', 'Before & after photos'],
    popular: false,
  },
  {
    id: 'tile-grout',
    name: 'Tile & Grout Cleaning',
    slug: 'tile-grout-cleaning',
    icon: Hammer,
    description: 'Deep cleaning and restoration for tile surfaces and grout lines.',
    longDescription: 'Our specialized equipment and cleaning solutions restore tile and grout to like-new condition. Removes years of built-up dirt and stains.',
    duration: 90,
    basePrice: 180,
    features: ['Deep grout cleaning', 'Stain removal', 'Colour sealing', 'Tile polishing', 'Anti-bacterial treatment'],
    includes: ['Grout inspection', 'Colour matching', 'Sealing application', 'Maintenance tips'],
    popular: false,
  },
  {
    id: 'machine-scrubbing',
    name: 'Machine Scrubbing',
    slug: 'machine-scrubbing',
    icon: Zap,
    description: 'Industrial floor scrubbing for large commercial and industrial spaces.',
    longDescription: 'Heavy-duty floor scrubbing using ride-on and walk-behind machines. Ideal for warehouses, factories, and large retail spaces.',
    duration: 150,
    basePrice: 160,
    features: ['Auto scrubber cleaning', 'Strip & wax', 'Burnishing', 'Concrete scrubbing', 'Epoxy floor care'],
    includes: ['Machine operators', 'Industrial equipment', 'Floor assessment', 'Maintenance schedule'],
    popular: false,
  },
  {
    id: 'polishing',
    name: 'Polishing',
    slug: 'polishing',
    icon: PaintBucket,
    description: 'Professional floor and surface polishing for a brilliant shine.',
    longDescription: 'Restore the natural beauty of your floors with our expert polishing services. Suitable for timber, marble, concrete, and terrazzo surfaces.',
    duration: 120,
    basePrice: 140,
    features: ['Timber floor polishing', 'Marble buffing', 'Concrete honing', 'Terrazzo restoration', 'Protective coating'],
    includes: ['Surface prep', 'Multi-stage polishing', 'Sealing application', 'Care instructions'],
    popular: false,
  },
  {
    id: 'sealing',
    name: 'Sealing',
    slug: 'sealing',
    icon: Shield,
    description: 'Protective sealing for natural stone, tile, and grout surfaces.',
    longDescription: 'Extend the life of your surfaces with our professional sealing services. Prevents staining, water damage, and makes cleaning easier.',
    duration: 90,
    basePrice: 150,
    features: ['Stone sealing', 'Grout sealing', 'Tile impregnating', 'Concrete sealing', 'Deck sealing'],
    includes: ['Surface testing', 'Product selection', 'Application', 'Cure time guidance'],
    popular: false,
  },
  {
    id: 'custom',
    name: 'Custom Cleaning',
    slug: 'custom-cleaning',
    icon: Wrench,
    description: 'Tailored cleaning solutions designed around your specific needs.',
    longDescription: 'Every space is unique. Our Custom Cleaning service is designed around your specific requirements, from one-off deep cleans to specialized tasks.',
    duration: 0,
    basePrice: 0,
    features: ['Customizable scope', 'Flexible scheduling', 'Specialized tasks', 'One-off or recurring', 'Tailored checklist'],
    includes: ['Free consultation', 'Custom quote', 'Dedicated team', 'Quality assurance'],
    popular: false,
    customQuote: true,
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useStatic, setUseStatic] = useState(false);

  useEffect(() => {
    servicesApi.getAll()
      .then(({ data }) => {
        if (data.data && data.data.length > 0) {
          setServices(data.data);
        } else {
          setUseStatic(true);
          setServices(STATIC_SERVICES);
        }
        setLoading(false);
      })
      .catch(() => {
        setUseStatic(true);
        setServices(STATIC_SERVICES);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600 text-lg">Loading services...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Cleaning Services</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Professional cleaning solutions for every need. Transparent pricing, experienced teams, and 100% satisfaction guaranteed.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => {
              const Icon = useStatic ? s.icon : Sparkles;
              return (
                <motion.div
                  key={s.id || s.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-neutral-200 hover:border-primary-300 relative"
                >
                  {s.popular && (
                    <div className="absolute -top-3 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Popular
                    </div>
                  )}
                  <Link href={useStatic ? `/services/${s.slug}` : `/services/${s.slug || s.id}`} className="block">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                      {useStatic ? <Icon className="w-6 h-6 text-primary-600" /> : <Sparkles className="w-6 h-6 text-primary-600" />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 hover:text-primary-600 transition-colors">{s.name}</h3>
                    <p className="text-neutral-600 mb-4 text-sm">{useStatic ? s.description : s.description}</p>

                    <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {s.customQuote ? 'Flexible' : `${s.duration || 120} min`}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {s.customQuote ? 'Custom Quote' : `From $${s.basePrice || 100}`}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {(useStatic ? s.features : s.features || []).slice(0, 4).map((f: string, j: number) => (
                        <div key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-neutral-700">{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <span className={`font-bold ${s.customQuote ? 'text-lg text-primary-600' : 'text-primary-600'}`}>
                        {s.customQuote ? 'Get Quote' : `$${s.basePrice || 100}`}
                      </span>
                      <span className="text-primary-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CleanPro?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Star, title: '5-Star Rated', desc: 'Trusted by thousands of happy customers' },
              { icon: Shield, title: 'Insured & Bonded', desc: 'Full coverage for your peace of mind' },
              { icon: Clock, title: 'Flexible Scheduling', desc: 'Book online 24/7, same-day available' },
              { icon: Sparkles, title: 'Eco-Friendly', desc: 'Safe products for your family & pets' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <item.icon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Spotless Space?</h2>
          <p className="text-xl text-neutral-300 mb-8">Book your cleaning today and get 10% off your first service.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn bg-primary-600 hover:bg-primary-700 text-lg px-8 py-3">Book Now <ArrowRight className="ml-2 w-5 h-5" /></Link>
            <Link href="/contact" className="btn border-2 border-neutral-600 hover:border-white text-lg px-8 py-3">Get a Quote</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
