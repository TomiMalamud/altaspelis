import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row mb-8">
        {/* Mobile Backdrop Skeleton */}
        <div className="w-full md:w-3/12 md:hidden mb-4">
          <Skeleton className="w-full h-48 rounded-lg" />
        </div>

        {/* Desktop Poster Skeleton */}
        <div className="w-5/12 mx-auto md:w-3/12 hidden md:block">
          <Skeleton className="w-full h-[450px] rounded-lg" />
        </div>

        {/* Movie Details Skeleton */}
        <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-2" />

          {/* Genres Skeleton */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>

          {/* Release Date and Runtime Skeleton */}
          <Skeleton className="h-4 w-48 mb-6" />

          {/* Director and Actors Skeleton */}
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />

          {/* Rating and Providers Skeleton */}
          <div className="flex flex-col sm:flex-row w-full gap-6">
            <div className="w-full sm:w-auto">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-24 w-48 rounded-md" />
            </div>
            <div className="w-full sm:w-auto mt-4 sm:mt-0">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-24 w-48 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Skeleton */}
      <Skeleton className="h-0.5 w-full my-8" />
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}