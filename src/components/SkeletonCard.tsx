export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Photo skeleton */}
      <div className="h-96 md:h-[500px] bg-gray-200"></div>

      {/* Info skeleton */}
      <div className="p-6">
        <div className="mb-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function SkeletonChatList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 p-4 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
