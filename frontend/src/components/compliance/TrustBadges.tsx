import { ShieldCheck, Building2, HardHat, Leaf, Lock, Star } from 'lucide-react';

interface TrustBadgesProps {
  state?: string;
  abn?: string;
  compact?: boolean;
}

// AU-specific trust elements for ACL compliance
export function TrustBadges({ state, abn = '12 345 678 901', compact = false }: TrustBadgesProps) {
  const badges = [
    {
      icon: <Building2 className="w-4 h-4" />,
      label: `ABN ${abn}`,
      variant: 'outline',
      ariaLabel: `Australian Business Number: ${abn}`,
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-green-600" />,
      label: '$20M Public Liability',
      variant: 'outline',
      ariaLabel: '20 million dollars public liability insurance',
    },
    ...(state ? [{
      icon: <HardHat className="w-4 h-4" />,
      label: `${state} WHS Compliant`,
      variant: 'secondary',
      ariaLabel: `Work Health and Safety compliant in ${state}`,
    }] : []),
    {
      icon: <Leaf className="w-4 h-4" />,
      label: 'Eco-Friendly Products',
      variant: 'outline',
      ariaLabel: 'Uses environmentally friendly cleaning products',
    },
    {
      icon: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
      label: '4.9★ (4,800+ reviews)',
      variant: 'none',
      ariaLabel: '4.9 out of 5 stars from over 4800 reviews',
    },
    {
      icon: <Lock className="w-4 h-4" />,
      label: 'Secure Payment',
      variant: 'outline',
      ariaLabel: 'Payments processed securely via Stripe',
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center" role="list" aria-label="Trust certifications">
        {badges.slice(0, 3).map((badge, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700"
            role="listitem"
            aria-label={badge.ariaLabel}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 items-center" role="list" aria-label="Trust certifications">
      {badges.map((badge, i) => {
        if (badge.variant === 'none') {
          return (
            <div
              key={i}
              className="flex items-center gap-1 text-sm"
              role="listitem"
              aria-label={badge.ariaLabel}
            >
              {badge.icon}
              <span className="font-medium">{badge.label.split(' ')[0]}</span>
              <span className="text-muted-foreground text-neutral-500">{badge.label.split(' ').slice(1).join(' ')}</span>
            </div>
          );
        }

        const variantClasses = {
          outline: 'bg-white border border-neutral-200',
          secondary: 'bg-neutral-100 border border-neutral-200',
        };

        return (
          <div
            key={i}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-neutral-700 ${variantClasses[badge.variant as keyof typeof variantClasses]}`}
            role="listitem"
            aria-label={badge.ariaLabel}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Bond-back guarantee disclosure component (ACL compliance)
export function BondBackGuarantee({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-primary-200 bg-primary-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-primary-900 mb-1">
            Bond-Back Guarantee
          </h4>
          <p className="text-sm text-primary-800 mb-2">
            We guarantee our end-of-lease cleaning will meet your property manager's standards.
          </p>
          <ul className="text-xs text-primary-700 space-y-1">
            <li className="flex items-start gap-1.5">
              <span className="text-primary-500">•</span>
              Free re-clean within 72 hours if agent is not satisfied
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary-500">•</span>
              100% refund if re-clean doesn't resolve issues
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary-500">•</span>
              Excludes damage not related to cleaning
            </li>
          </ul>
          <p className="text-xs text-primary-600 mt-2">
            Terms apply. See our <a href="/terms" className="underline">Terms of Service</a> for full details.
          </p>
        </div>
      </div>
    </div>
  );
}

// GST pricing disclosure (ACL compliance)
export function GSTDisclosure() {
  return (
    <p className="text-xs text-neutral-500 mt-1">
      All prices shown in AUD and include GST where applicable.
    </p>
  );
}
