import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-20" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section title */}
      <Skeleton className="h-6 w-40" />

      {/* Table */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
