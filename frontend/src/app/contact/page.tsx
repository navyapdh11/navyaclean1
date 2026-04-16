'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Phone, Mail, MapPin, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success('Message sent. We will reply within 24 hours.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-neutral-100 max-w-3xl mx-auto"
          >
            Questions or booking requests? We are here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Phone</h3>
                  <p className="text-neutral-700">1-800-CLEANPRO (1-800-253-2677)</p>
                  <p className="text-neutral-700">Mon-Fri: 8am-6pm, Sat: 9am-4pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                  <p className="text-neutral-700">support@cleanpro.com</p>
                  <p className="text-neutral-700">We respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Office</h3>
                  <p className="text-neutral-700">123 Clean Street</p>
                  <p className="text-neutral-700">Sydney, NSW 2000, Australia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Business Hours</h3>
                  <p className="text-neutral-700">Monday-Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-neutral-700">Saturday: 9:00 AM - 4:00 PM</p>
                  <p className="text-neutral-700">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="booking">Booking Question</option>
                  <option value="billing">Billing Issue</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
