import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-1.5 h-4 w-44" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Stats — 5 cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm"
          >
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="mt-3 h-8 w-12" />
            <Skeleton className="mt-1 h-4 w-24" />
            <Skeleton className="mt-0.5 h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      {/* Table section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <Skeleton className="h-11 w-full rounded-none" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full rounded-none border-t border-zinc-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
