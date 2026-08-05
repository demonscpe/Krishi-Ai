import React from 'react';

export const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-slate-100 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
    <Shimmer className="h-36 w-full" />
    <Shimmer className="h-4 w-3/4" />
    <Shimmer className="h-3 w-1/2" />
    <Shimmer className="h-8 w-full" />
  </div>
);

export const SectionSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);
