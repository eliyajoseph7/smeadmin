import React from 'react';

interface ShimmerLoaderProps {
  className?: string;
}

export const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}>
      <div className="invisible">Loading...</div>
    </div>
  );
};

export const ActivityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <ShimmerLoader className="h-6 w-32" />
        <ShimmerLoader className="h-8 w-16 rounded-full" />
      </div>
      <ShimmerLoader className="h-8 w-20 mb-2" />
      <ShimmerLoader className="h-4 w-24" />
    </div>
  );
};

export const ActivityItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
      <ShimmerLoader className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <ShimmerLoader className="h-4 w-48" />
          <ShimmerLoader className="h-3 w-16" />
        </div>
        <ShimmerLoader className="h-3 w-32" />
        <div className="flex items-center space-x-4">
          <ShimmerLoader className="h-3 w-20" />
          <ShimmerLoader className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};

export const ActiveUserSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <ShimmerLoader className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <ShimmerLoader className="h-4 w-24" />
          <ShimmerLoader className="h-3 w-32" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <ShimmerLoader className="h-4 w-12" />
        <ShimmerLoader className="h-3 w-16" />
      </div>
    </div>
  );
};

export const ActivityDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerLoader className="h-8 w-48" />
          <ShimmerLoader className="h-4 w-64" />
        </div>
        <ShimmerLoader className="h-10 w-32" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ActivityCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities List Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <ShimmerLoader className="h-6 w-32" />
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Active Users Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <ShimmerLoader className="h-6 w-28" />
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <ActiveUserSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
