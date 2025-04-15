import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    console.log("Loading...")
  return (
    <div className="container mx-auto">
        <p>LOADING</p>
      {/* Search Bar Skeleton */}
      <div className="mb-4 flex items-center h-10">
        <Skeleton className="h-full flex-grow mr-2 bg-gray-800" />
        <Skeleton className="h-full w-20 bg-gray-800" /> 
      </div>

      {/* Movie Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Render multiple movie card skeletons */}
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-full rounded-sm bg-gray-800" />
        ))}
      </div>
    </div>
  );
}
