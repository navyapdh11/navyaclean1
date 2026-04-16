'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Shimmer style for skeleton loading
// ---------------------------------------------------------------------------
const shimmerStyle = {
  background:
    'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
  backgroundSize: '200% 100%',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SkeletonVariant =
  | 'card'
  | 'table'
  | 'stat'
  | 'chart'
  | 'text'
  | 'avatar'
  | 'button'
  | 'image'
  | 'list';

export interface LoadingSkeletonProps {
  /** Pre-defined shape to render */
  variant?: SkeletonVariant;
  /** Override or supplement with a custom list of bar/box specs */
  rows?: SkeletonRowSpec[];
  /** Number of repeated items (used by list / table variants) */
  count?: number;
  /** Extra className on the root wrapper */
  className?: string;
  /** Whether to wrap each row in a Framer Motion stagger fade */
  animate?: boolean;
}

export interface SkeletonRowSpec {
  /** Width as CSS string (e.g. "w-3/4", "w-48", "w-full") */
  width?: string;
  /** Height utility (e.g. "h-4", "h-12") */
  height?: string;
  /** Extra classes on this individual bar */
  className?: string;
}

// ---------------------------------------------------------------------------
// Single shimmer bar (the atomic building block)
// ---------------------------------------------------------------------------
function ShimmerBar({
  width = 'w-full',
  height = 'h-4',
  className,
}: SkeletonRowSpec) {
  return (
    <motion.div
      className={cn('rounded-lg', width, height)}
      style={shimmerStyle}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Variant row definitions
// ---------------------------------------------------------------------------
const variantRows: Record<SkeletonVariant, SkeletonRowSpec[]> = {
  card: [
    { height: 'h-40', className: 'rounded-xl' },
    { height: 'h-4', width: 'w-3/4' },
    { height: 'h-3', width: 'w-full' },
    { height: 'h-3', width: 'w-5/6' },
  ],
  table: [
    { height: 'h-4', width: 'w-full' },
    { height: 'h-4', width: 'w-full' },
    { height: 'h-4', width: 'w-5/6' },
    { height: 'h-4', width: 'w-3/4' },
  ],
  stat: [
    { height: 'h-12 w-12 rounded-xl' },
    { height: 'h-6', width: 'w-24' },
    { height: 'h-3', width: 'w-32' },
  ],
  chart: [
    { height: 'h-48', className: 'rounded-xl' },
    { height: 'h-3', width: 'w-40' },
  ],
  text: [
    { height: 'h-5', width: 'w-3/4' },
    { height: 'h-3', width: 'w-full' },
    { height: 'h-3', width: 'w-5/6' },
  ],
  avatar: [
    { height: 'h-10 w-10 rounded-full' },
  ],
  button: [
    { height: 'h-10', width: 'w-32 rounded-lg' },
  ],
  image: [
    { height: 'h-48', className: 'rounded-xl' },
  ],
  list: [
    { height: 'h-4', width: 'w-full' },
    { height: 'h-4', width: 'w-5/6' },
    { height: 'h-4', width: 'w-3/4' },
  ],
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function LoadingSkeleton({
  variant = 'card',
  rows,
  count,
  className,
  animate = true,
}: LoadingSkeletonProps) {
  const rowSpecs = rows ?? variantRows[variant];
  const repeatCount = count ?? 1;

  const renderRows = (keyPrefix: string) =>
    rowSpecs.map((row, idx) => {
      const bar = <ShimmerBar key={`${keyPrefix}-${idx}`} {...row} />;
      if (!animate) return bar;
      return (
        <motion.div
          key={`${keyPrefix}-${idx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.08 }}
        >
          {bar}
        </motion.div>
      );
    });

  // Table variant: render a faux table header + rows
  if (variant === 'table') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Fake header */}
        <div className="flex gap-4 pb-2 border-b border-neutral-200">
          {[
            { w: 'w-1/4' },
            { w: 'w-1/4' },
            { w: 'w-1/6' },
            { w: 'w-1/6' },
            { w: 'w-1/6' },
          ].map((col, i) => (
            <ShimmerBar
              key={`header-${i}`}
              height="h-3"
              width={col.w}
              className=""
            />
          ))}
        </div>
        {/* Fake body rows */}
        {Array.from({ length: repeatCount }).map((_, groupIdx) => (
          <div key={`row-group-${groupIdx}`} className="flex gap-4">
            {[
              { w: 'w-1/4' },
              { w: 'w-1/4' },
              { w: 'w-1/6' },
              { w: 'w-1/6' },
              { w: 'w-1/6' },
            ].map((col, i) => (
              <ShimmerBar
                key={`body-${groupIdx}-${i}`}
                height="h-4"
                width={col.w}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Stat variant: render as a faux stat card
  if (variant === 'stat') {
    return (
      <div className={cn('bg-white rounded-xl p-6 shadow-sm space-y-4', className)}>
        {renderRows('stat')}
      </div>
    );
  }

  // Chart variant
  if (variant === 'chart') {
    return (
      <div className={cn('bg-white rounded-xl p-6 shadow-sm space-y-4', className)}>
        {renderRows('chart')}
      </div>
    );
  }

  // Card variant (default)
  if (variant === 'card') {
    return (
      <div className={cn('bg-white rounded-xl p-6 shadow-sm space-y-3', className)}>
        {renderRows('card')}
      </div>
    );
  }

  // Generic / text / avatar / button / image / list
  return (
    <div className={cn('space-y-3', className)}>
      {renderRows('generic')}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convenience: grid of stat skeletons (e.g. 4 dashboard KPI cards)
// ---------------------------------------------------------------------------
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} variant="stat" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convenience: dashboard full-page loading skeleton
// ---------------------------------------------------------------------------
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton variant="text" className="max-w-xs" />
      <StatGridSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton variant="chart" />
        <LoadingSkeleton variant="chart" />
      </div>
      <LoadingSkeleton variant="table" count={5} />
    </div>
  );
}
