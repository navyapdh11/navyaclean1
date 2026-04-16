// AU-compliant structured data for local business SEO
// Fixed for Google Rich Results validation:
// - Removed fake aggregateRating (requires real review content on page)
// - bestRating/worstRating are numbers, not strings
// - All fields match Google's structured data guidelines

export function generateLocalBusinessSchema({
  businessName = 'CleanPro Enterprise',
  abn = '12 345 678 901',
  phone = '+61 1300 123 456',
  serviceAreas = ['Sydney', 'Melbourne', 'Brisbane'],
  states = ['NSW', 'VIC', 'QLD'],
}: {
  businessName?: string;
  abn?: string;
  phone?: string;
  serviceAreas?: string[];
  states?: string[];
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "HouseCleaningService",
    name: businessName,
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cleaning-services-enterprise-2026.vercel.app'}/og-image.png`,
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cleaning-services-enterprise-2026.vercel.app'}/#business`,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cleaning-services-enterprise-2026.vercel.app',
    telephone: phone,
    priceRange: '$$',
    address: {
      "@type": "PostalAddress",
      addressCountry: "AU",
      addressRegion: states[0] || 'NSW',
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.8688,
      longitude: 151.2093,
    },
    // AU-specific: ABN disclosure per ASIC guidelines
    vatID: `ABN ${abn}`,
    areaServed: serviceAreas.map(area => ({
      "@type": "City",
      name: area,
    })),
    // State-specific compliance
    additionalProperty: states.map(state => ({
      "@type": "PropertyValue",
      name: `${state} Service Area`,
      value: `WHS Act 2011 (${state}) Compliant`,
    })),
  };
}

// Service-specific schema for each service page
// Google Rich Results compliant
export function generateServiceSchema({
  name,
  description,
  price,
  priceCurrency = 'AUD',
  serviceType,
  areaServed = 'Australia',
}: {
  name: string;
  description: string;
  price: string;
  priceCurrency?: string;
  serviceType?: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: serviceType || name,
    name,
    description,
    provider: {
      "@type": "HouseCleaningService",
      name: "CleanPro Enterprise",
    },
    areaServed: {
      "@type": "Place",
      name: areaServed,
    },
    offers: {
      "@type": "Offer",
      price: price.replace(/[^0-9.]/g, ''),
      priceCurrency,
      description: `Starting from ${price} ${priceCurrency}`,
    },
  };
}

// FAQ schema for service pages — Google Rich Results compliant
export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// Review aggregate schema — ONLY use on pages that display reviews
// bestRating/worstRating are numbers (not strings) per Google guidelines
export function generateReviewSchema({
  rating,
  count,
  bestRating = 5,
  worstRating = 1,
}: {
  rating: number;
  count: number;
  bestRating?: number;
  worstRating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: rating,
    reviewCount: count,
    bestRating: bestRating,
    worstRating: worstRating,
  };
}
