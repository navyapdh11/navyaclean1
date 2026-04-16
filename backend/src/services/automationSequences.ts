// Marketing automation sequences for CleanPro AU
// Compliant with: Spam Act 2003, Privacy Act 1988 (APP 7), Australian Consumer Law

export interface EmailSequence {
  id: string;
  name: string;
  trigger: string;
  timing: string;
  requiresConsent: boolean;
  subject: string;
  template: string;
  unsubscribeRequired: boolean;
}

// All email sequences mapped to compliance requirements
export const emailSequences: EmailSequence[] = [
  // TRANSACTIONAL - APP 7 exempt, no consent required
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    trigger: 'booking_created',
    timing: 'immediate',
    requiresConsent: false, // Transactional per APP 7
    subject: 'Your CleanPro booking confirmed for {date}',
    template: 'booking_confirmation',
    unsubscribeRequired: false,
  },
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    trigger: 'payment_completed',
    timing: 'immediate',
    requiresConsent: false,
    subject: 'Payment receipt - $${amount} AUD',
    template: 'payment_receipt',
    unsubscribeRequired: false,
  },
  {
    id: 'appointment-reminder-24h',
    name: '24h Appointment Reminder',
    trigger: '24h_before_service',
    timing: '24 hours before',
    requiresConsent: false,
    subject: 'Your CleanPro service is tomorrow at {time}',
    template: 'booking_reminder',
    unsubscribeRequired: false,
  },
  {
    id: 'appointment-reminder-1h',
    name: '1h Appointment Reminder',
    trigger: '1h_before_service',
    timing: '1 hour before',
    requiresConsent: false,
    subject: 'Your cleaner arrives in 1 hour',
    template: 'booking_reminder_short',
    unsubscribeRequired: false,
  },

  // MARKETING - requires consent per APP 7
  {
    id: 'review-request',
    name: 'Post-Service Review Request',
    trigger: 'service_completed',
    timing: '2 hours after',
    requiresConsent: true, // Marketing per APP 7
    subject: 'How did we do, {name}? Share your {suburb} clean experience',
    template: 'review_request',
    unsubscribeRequired: true,
  },
  {
    id: 'welcome-series-1',
    name: 'Welcome Series - Email 1',
    trigger: 'registration_completed',
    timing: 'immediate',
    requiresConsent: true,
    subject: 'Welcome to CleanPro, {name}! Here is 10% off your first clean',
    template: 'welcome_series_1',
    unsubscribeRequired: true,
  },
  {
    id: 'winback-day30',
    name: 'Win-Back - 30 Days',
    trigger: 'no_booking_30_days',
    timing: '30 days after last booking',
    requiresConsent: true,
    subject: 'We miss keeping {suburb} sparkling, {name}!',
    template: 'winback_30',
    unsubscribeRequired: true,
  },
  {
    id: 'winback-day90',
    name: 'Win-Back - 90 Days',
    trigger: 'no_booking_90_days',
    timing: '90 days after last booking',
    requiresConsent: true,
    subject: 'Your 15% welcome-back offer is expiring soon',
    template: 'winback_90',
    unsubscribeRequired: true,
  },

  // EDUCATIONAL - requires consent
  {
    id: 'education-bond-checklist',
    name: 'Education: Bond-Back Checklist',
    trigger: 'content_signup',
    timing: 'weekly',
    requiresConsent: true,
    subject: 'Bond-Back Checklist: What your agent really looks for',
    template: 'education_bond_checklist',
    unsubscribeRequired: true,
  },
  {
    id: 'education-eco-cleaning',
    name: 'Education: Eco-Friendly Cleaning',
    trigger: 'content_signup',
    timing: 'weekly + 1',
    requiresConsent: true,
    subject: 'The eco-friendly products we use (and why they work better)',
    template: 'education_eco',
    unsubscribeRequired: true,
  },
];

// SMS sequences - ACMA compliant
export const smsSequences = [
  {
    id: 'sms-booking-confirm',
    trigger: 'booking_created',
    requiresConsent: false, // Transactional
    content: 'Hi {name}, your CleanPro {service} is booked for {date} at {time} in {suburb}. Reply C to confirm, R to reschedule. 1300 XXX XXX. STOP to opt out.',
  },
  {
    id: 'sms-reminder-24h',
    trigger: '24h_before_service',
    requiresConsent: true,
    content: '{name}, your CleanPro clean is tomorrow at {time} in {suburb}. Our cleaner is on the way. Questions? Call 1300 XXX XXX. STOP to opt out.',
  },
  {
    id: 'sms-complete',
    trigger: 'service_completed',
    requiresConsent: false,
    content: 'Your {suburb} clean is complete! Rate your experience: {review_link}. CleanPro AU - ABN XX XXX XXX XXX',
  },
  {
    id: 'sms-promo',
    trigger: 'consent_given',
    requiresConsent: true,
    frequency: 'max 2 per month',
    content: '{name}, exclusive: 20% off carpet cleaning in {state} this month. Book by {date}: {link}. STOP to unsubscribe. CleanPro AU',
  },
];

// AU compliance metadata
export const complianceMetadata = {
  // Spam Act 2003
  spamAct: {
    consentRequired: 'Express opt-in for marketing emails/SMS',
    functionalUnsubscribe: 'Must work within 5 business days',
    senderIdentification: 'Business name must be clearly visible',
    physicalAddress: 'Required in email footer',
  },
  // Privacy Act 1988 - APP 7
  app7: {
    directMarketing: 'Must not use personal info for direct marketing unless consent given or reasonable expectation',
    optOut: 'Simple means to opt out must be provided in every marketing communication',
    sourceDisclosure: 'Must disclose source of personal info upon request',
  },
  // Australian Consumer Law
  acl: {
    noMisleadingClaims: 'Review incentives must not bias towards positive reviews',
    clearPricing: 'All prices must include GST and be in AUD',
    guaranteeDisclosure: 'Terms of guarantees must be clearly stated',
  },
};

// Template data builders
export function buildBookingConfirmationData(booking: {
  service: string;
  date: string;
  time: string;
  suburb: string;
  cleanerName: string;
  price: number;
}) {
  return {
    firstName: booking.cleanerName,
    service: booking.service,
    date: booking.date,
    time: booking.time,
    suburb: booking.suburb,
    cleanerName: booking.cleanerName,
    price: `$${booking.price} AUD (incl. GST)`,
  };
}

export function buildReviewRequestData(data: {
  name: string;
  suburb: string;
  service: string;
  reviewLink: string;
}) {
  return {
    name: data.name,
    suburb: data.suburb,
    service: data.service,
    reviewLink: data.reviewLink,
    disclaimer: 'Reviews are voluntary. No incentives offered for positive feedback.',
  };
}
