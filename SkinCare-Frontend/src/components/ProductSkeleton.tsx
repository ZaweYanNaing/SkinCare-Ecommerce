interface ProductSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export default function ProductSkeleton({ count = 8, viewMode = 'grid' }: ProductSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image Skeleton */}
              <div className="flex-shrink-0">
                <div className="w-full sm:w-32 h-48 sm:h-32 bg-gray-200 rounded-lg"></div>
              </div>

              {/* Content Skeleton */}
              <div className="flex-1 space-y-3">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>

                {/* Details */}
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          {/* Image Skeleton */}
          <div className="w-full h-48 sm:h-56 bg-gray-200"></div>
          
          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            {/* Details */}
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>

            {/* Price */}
            <div className="h-6 bg-gray-200 rounded w-20"></div>

            {/* Mobile Actions */}
            <div className="sm:hidden flex gap-2 pt-2">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}