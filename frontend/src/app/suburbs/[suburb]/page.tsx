import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Sparkles,
  Droplets,
  Home,
  Building,
  Wind,
  TreePine,
  Trash2,
  Sofa,
  Shield,
  Star,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SYDNEY_SUBURBS = [
  'bondi', 'bondi-beach', 'bondi-junction', 'manly', 'darlinghurst', 'surry-hills',
  'newtown', 'glebe', 'paddington', 'woollahra', 'double-bay', 'point-piper',
  'rose-bay', 'vaucluse', 'dover-heights', 'bronte', 'clovelly', 'randwick',
  'coogee', 'maroubra', 'kingsford', 'kensington', 'zetland', 'waterloo',
  'redfern', 'chippendale', 'pyrmont', 'ultimo', 'haymarket', 'the-rocks',
  'circular-quay', 'millers-point', 'dawes-point', 'mcmahons-point', 'kirribilli',
  'neutral-bay', 'cremorne', 'mosman', 'taronga', 'cammeray', 'north-sydney',
  'crows-nest', 'st-leonards', 'chatswood', 'willoughby', 'lane-cove',
  'greenwich', 'riverside', 'hunters-hill', 'ryde', 'eastwood',
  'north-ryde', 'macquarie-park', 'marsfield', 'epping', 'carlingford',
  'parramatta', 'homebush', 'strathfield', 'burwood', 'ashfield',
  'leichhardt', 'annandale', 'balmain', 'birchgrove', 'rozelle',
  'lilyfield', 'haberfield', 'five-dock', 'rhodes', 'liberty-grove',
  'wenworth-point', 'sydney-olympic-park', 'auburn', 'lidcombe',
  'bankstown', 'canterbury', 'hurlstone-park', 'campsie', 'belmore',
  'lakemba', 'wiley-park', 'punchbowl', 'narwee', 'riverwood',
  'hurstville', 'kogarah', 'rockdale', 'brighton-le-sands',
  'botany', 'mascot', 'tempe', 'sydenham', 'marrickville',
  'dulwich-hill', 'lewisham', 'petersham', 'stanmore',
].sort();

const SERVICES = [
  { id: 'standard', name: 'Standard Cleaning', icon: Sparkles, price: 120, description: 'Regular home cleaning' },
  { id: 'deep', name: 'Deep Cleaning', icon: Droplets, price: 250, description: 'Intensive deep clean' },
  { id: 'end-of-lease', name: 'End of Lease Cleaning', icon: Home, price: 350, description: 'Bond-back guaranteed' },
  { id: 'office', name: 'Office Cleaning', icon: Building, price: 200, description: 'Commercial spaces' },
  { id: 'carpet', name: 'Carpet Cleaning', icon: Wind, price: 150, description: 'Steam carpet cleaning' },
  { id: 'window', name: 'Window Cleaning', icon: Droplets, price: 100, description: 'Interior & exterior' },
  { id: 'pressure-washing', name: 'Pressure Washing', icon: Droplets, price: 200, description: 'Outdoor surfaces' },
  { id: 'garden', name: 'Garden Maintenance', icon: TreePine, price: 120, description: 'Lawn & garden care' },
  { id: 'pest-control', name: 'Pest Control', icon: Trash2, price: 180, description: 'Pest elimination' },
  { id: 'upholstery', name: 'Upholstery Cleaning', icon: Sofa, price: 140, description: 'Furniture cleaning' },
  { id: 'builders-clean', name: 'Builders Clean', icon: Shield, price: 400, description: 'Post-construction clean' },
];

const LOCAL_CLEANERS = [
  { name: 'Sarah M.', rating: 4.9, jobs: 342, specialty: 'Deep Cleaning', experience: '8 years' },
  { name: 'James K.', rating: 4.8, jobs: 256, specialty: 'End of Lease', experience: '5 years' },
  { name: 'Maria L.', rating: 5.0, jobs: 189, specialty: 'Standard Cleaning', experience: '6 years' },
];

const TESTIMONIALS: Record<string, { name: string; rating: number; text: string; date: string }[]> = {
  'bondi': [
    { name: 'Emma T.', rating: 5, text: 'Best cleaning service in Bondi! Always reliable and thorough.', date: '2 weeks ago' },
    { name: 'David R.', rating: 5, text: 'Used them for end of lease clean, got full bond back!', date: '1 month ago' },
  ],
  'manly': [
    { name: 'Lisa W.', rating: 5, text: 'Fantastic service for our beachside apartment.', date: '3 weeks ago' },
    { name: 'Michael B.', rating: 4, text: 'Very professional team, great attention to detail.', date: '2 months ago' },
  ],
};

const DEFAULT_TESTIMONIALS = [
  { name: 'Sarah P.', rating: 5, text: 'Excellent service, highly recommend!', date: '1 week ago' },
  { name: 'Tom H.', rating: 5, text: 'Professional and punctual. Will use again.', date: '2 weeks ago' },
  { name: 'Jane M.', rating: 4, text: 'Great value for money, very satisfied.', date: '1 month ago' },
];

function formatSuburbName(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function generateStaticParams() {
  return SYDNEY_SUBURBS.map((suburb) => ({
    suburb,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ suburb: string }> }): Promise<Metadata> {
  const { suburb } = await params;
  const suburbName = formatSuburbName(suburb);
  return {
    title: `Cleaning Services in ${suburbName} | CleanPro Enterprise`,
    description: `Professional cleaning services in ${suburbName}, Sydney. Standard, deep, end-of-lease, office cleaning and more. Book now!`,
    keywords: `cleaning services ${suburbName}, cleaners ${suburbName}, house cleaning ${suburbName}, end of lease ${suburbName}`,
    openGraph: {
      title: `Cleaning Services in ${suburbName} | CleanPro Enterprise`,
      description: `Professional cleaning services in ${suburbName}, Sydney.`,
      type: 'website',
    },
  };
}

export default async function SuburbPage({ params }: { params: Promise<{ suburb: string }> }) {
  const { suburb } = await params;

  if (!SYDNEY_SUBURBS.includes(suburb)) {
    notFound();
  }

  const suburbName = formatSuburbName(suburb);
  const suburbTestimonials = TESTIMONIALS[suburb] || DEFAULT_TESTIMONIALS;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-blue-200 mb-4">
              <MapPin className="w-5 h-5" />
              <span>Serving {suburbName}, Sydney</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Cleaning Services in {suburbName}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Trusted by 500+ homes and businesses in {suburbName}. Book experienced cleaners today.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all"
            >
              <Calendar className="w-5 h-5" />
              Book Now in {suburbName}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Homes Cleaned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15+</div>
              <div className="text-gray-600">Local Cleaners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">Same Day</div>
              <div className="text-gray-600">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Available */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Services Available in {suburbName}</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We offer a full range of professional cleaning services tailored to {suburbName} properties
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-500 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${service.price}</span>
                    <Link
                      href={`/book?service=${service.id}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Local Cleaners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our {suburbName} Cleaners</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Experienced, vetted, and local cleaning professionals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LOCAL_CLEANERS.map((cleaner) => (
              <div key={cleaner.name} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {cleaner.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cleaner.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{cleaner.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Specialty</span>
                    <span className="font-medium">{cleaner.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs Completed</span>
                    <span className="font-medium">{cleaner.jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience</span>
                    <span className="font-medium">{cleaner.experience}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Background checked & insured
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pricing for {suburbName}</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Transparent pricing with no hidden fees
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">Standard</h3>
              <p className="text-gray-500 mb-4">Regular maintenance</p>
              <div className="text-4xl font-bold mb-6">$120</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Kitchen & bathrooms</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Vacuuming & mopping</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Surface dusting</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Rubbish removal</li>
              </ul>
              <Link href="/book" className="block text-center bg-gray-100 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all">
                Book Standard
              </Link>
            </div>

            <div className="border-2 border-blue-500 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Deep Clean</h3>
              <p className="text-gray-500 mb-4">Intensive cleaning</p>
              <div className="text-4xl font-bold text-blue-600 mb-6">$250</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Everything in Standard</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Inside cabinets</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Baseboards & skirting</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Light fixtures</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Behind appliances</li>
              </ul>
              <Link href="/book" className="block text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all">
                Book Deep Clean
              </Link>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">End of Lease</h3>
              <p className="text-gray-500 mb-4">Bond-back guarantee</p>
              <div className="text-4xl font-bold mb-6">$350</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Everything in Deep Clean</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Oven & stovetop</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Window tracks</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Carpet steam clean</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Bond-back guarantee</li>
              </ul>
              <Link href="/book" className="block text-center bg-gray-100 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all">
                Book End of Lease
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What {suburbName} Residents Say</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Real reviews from local customers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {suburbTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{testimonial.name}</span>
                  <span>{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book in {suburbName}?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 500+ satisfied customers in {suburbName}. Same-day booking available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all"
            >
              <Calendar className="w-5 h-5" />
              Book Online Now
            </Link>
            <a
              href="tel:1300CLEAN"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              <Phone className="w-5 h-5" />
              Call 1300 CLEAN
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
