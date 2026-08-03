import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingSkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Height per item */
  height?: string;
  /** Layout: stacked rows or grid */
  layout?: "stack" | "grid" | "list";
  className?: string;
}

/**
 * Consistent loading skeleton for tables/lists during data fetch.
 * `stack`: simple stacked rows (e.g. table rows).
 * `list`: card-like rows with icon + text lines.
 * `grid`: uniform grid of blocks.
 */
export function LoadingSkeleton({
  count = 5,
  height = "h-14",
  layout = "stack",
  className,
}: LoadingSkeletonProps) {
  if (layout === "grid") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className={cn("w-full", height)} />
        ))}
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border p-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // stack (default)
  return (
    <div className={cn("space-y-3 p-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full", height)} />
      ))}
    </div>
  );
}
