// AU-compliant structured data for local business SEO
// Fixed: No spaces in JSON-LD keys (original doc had " @context" which is invalid)

export function generateLocalBusinessSchema({
  businessName = 'CleanPro Enterprise',
  abn = '12 345 678 901',
  phone = '+61 1300 123 456',
  serviceAreas = ['Sydney', 'Melbourne', 'Brisbane'],
  states = ['NSW', 'VIC', 'QLD'],
  reviews = { rating: 4.9, count: 4800 },
}: {
  businessName?: string;
  abn?: string;
  phone?: string;
  serviceAreas?: string[];
  states?: string[];
  reviews?: { rating: number; count: number };
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
      "@type": "AdministrativeArea",
      name: area,
    })),
    // Australian Consumer Law: guarantee disclosure
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bond-Back Guarantee",
            description: "100% refund or free re-clean if not satisfied",
            areaServed: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "AUD",
            price: "0",
            description: "Included with End of Lease service",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviews.rating,
      reviewCount: reviews.count,
      bestRating: "5",
      worstRating: "1",
    },
    // State-specific compliance badges
    additionalProperty: states.map(state => ({
      "@type": "PropertyValue",
      name: `${state} Compliance`,
      value: `WHS Act 2011 (${state}) Compliant`,
    })),
  };
}

// Service-specific schema for each service page
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

// FAQ schema for service pages
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

// Review aggregate schema
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
    bestRating: String(bestRating),
    worstRating: String(worstRating),
  };
}
