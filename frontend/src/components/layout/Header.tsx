'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sparkles, Shield, Clock, Star, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { DynamicMenu } from '@/components/menu/DynamicMenu';

const allServices = [
  { name: 'Regular Cleaning', slug: 'regular-cleaning' },
  { name: 'End of Lease Cleaning', slug: 'end-of-lease' },
  { name: 'Commercial Cleaning', slug: 'commercial-cleaning' },
  { name: 'Carpet Cleaning', slug: 'carpet-cleaning' },
  { name: 'Window Cleaning', slug: 'window-cleaning' },
  { name: 'Pressure Washing', slug: 'pressure-washing' },
  { name: 'Tile & Grout Cleaning', slug: 'tile-grout-cleaning' },
  { name: 'Machine Scrubbing', slug: 'machine-scrubbing' },
  { name: 'Polishing', slug: 'polishing' },
  { name: 'Sealing', slug: 'sealing' },
  { name: 'Custom Cleaning', slug: 'custom-cleaning' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">CleanPro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-neutral-600 hover:text-primary-600 transition-colors"
              >
                Services <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {servicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50"
                  >
                    <Link
                      href="/services"
                      className="block px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      All Services →
                    </Link>
                    <div className="border-t border-neutral-200 my-1" />
                    {allServices.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">About</Link>
            <Link href="/pricing" className="text-neutral-600 hover:text-primary-600 transition-colors">Pricing</Link>
            <Link href="/contact" className="text-neutral-600 hover:text-primary-600 transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <DynamicMenu />
                <Link href="/dashboard" className="btn-primary">Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">Sign In</Link>
                <Link href="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="pb-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Services</p>
                <Link href="/services" className="block py-1.5 text-sm font-medium text-primary-600" onClick={() => setMobileMenuOpen(false)}>All Services →</Link>
                {allServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="block py-1.5 text-sm text-neutral-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <Link href="/about" className="block py-2 text-neutral-600" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/pricing" className="block py-2 text-neutral-600" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/contact" className="block py-2 text-neutral-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
              {isAuthenticated ? (
                <Link href="/dashboard" className="block btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="block btn-secondary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link href="/register" className="block btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
