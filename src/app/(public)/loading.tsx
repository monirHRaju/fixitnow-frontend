import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero skeleton */}
      <div className="space-y-4 text-center">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Search / filter bar */}
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-xl p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}