import { MetadataRoute } from 'next';

// Static routes that always exist
const STATIC_ROUTES = [
  { url: '', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
  { url: '/services', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  { url: '/pricing', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  { url: '/about', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  { url: '/contact', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  { url: '/book', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  { url: '/suburbs', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
];

// Service pages - matches actual routes in the project
const SERVICE_PAGES = [
  'regular-cleaning',
  'deep-cleaning',
  'commercial-cleaning',
  'end-of-lease',
  'carpet-cleaning',
  'window-cleaning',
  'pressure-washing',
  'tile-grout-cleaning',
  'machine-scrubbing',
  'polishing',
  'sealing',
  'custom-cleaning',
];

// Australian states for location pages
const AU_STATES = [
  'nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt'
];

// Sample suburbs - matches project's suburb pages
const AU_SUBURBS = [
  'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
  'gold-coast', 'canberra', 'hobart', 'darwin',
  'parramatta', 'chatswood', 'bondi', 'manly',
  'richmond', 'st-kilda', 'southbank', 'fitzroy',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cleaning-services-enterprise-2026.vercel.app';

  // Static pages
  const staticPages = STATIC_ROUTES.map(route => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Service pages
  const servicePages = SERVICE_PAGES.map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // State + service combination pages (for local SEO)
  const stateServicePages = SERVICE_PAGES.flatMap(slug =>
    AU_STATES.map(state => ({
      url: `${baseUrl}/services/${slug}/${state}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  );

  // Suburb pages
  const suburbPages = AU_SUBURBS.map(suburb => ({
    url: `${baseUrl}/suburbs/${suburb}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...servicePages, ...stateServicePages, ...suburbPages];
}
