import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarioLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Navigation header */}
        <div className="border-b px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-9 rounded-none" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="min-h-[100px] rounded-none" />
          ))}
        </div>

        {/* Legend */}
        <div className="border-t px-4 py-3">
          <div className="flex flex-wrap gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
