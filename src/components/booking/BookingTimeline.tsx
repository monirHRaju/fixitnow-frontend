import { cn } from "@/lib/utils";
import { getStatusMeta } from "@/components/booking/BookingStatusBadge";

export interface TimelineEvent {
  status: string;
  date?: string;
  /** Optional custom label; defaults to the status label. */
  label?: string;
}

interface BookingTimelineProps {
  events: TimelineEvent[];
  /** The booking's current status — the matching event is rendered as "active". */
  currentStatus?: string;
  className?: string;
}

/**
 * Reusable vertical timeline for a booking's lifecycle.
 * Each step is color-coded by status, the active (current) step is highlighted
 * and shows its actionable hint, and connecting lines link the steps.
 */
export function BookingTimeline({
  events,
  currentStatus,
  className,
}: BookingTimelineProps) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline events yet.</p>;
  }

  const lastIndex = events.length - 1;

  return (
    <div className={cn("relative", className)}>
      {events.map((event, idx) => {
        const meta = getStatusMeta(event.status);
        const isActive = currentStatus && event.status === currentStatus;
        const isPast =
          currentStatus !== undefined &&
          event.status !== currentStatus &&
          idx < events.length - 1;

        return (
          <div key={`${event.status}-${idx}`} className="flex gap-3 pb-6 last:pb-0">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                  isActive
                    ? cn("border-transparent", meta.dot, "ring-2 ring-offset-2 ring-offset-background")
                    : "border-muted-foreground/30 bg-background"
                )}
              >
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              {idx < lastIndex && (
                <div
                  className={cn(
                    "mt-1 h-full w-0.5",
                    isPast ? "bg-muted-foreground/20" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {event.label || meta.label}
                </p>
                {isActive && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Current
                  </span>
                )}
              </div>
              {event.date && (
                <p className="text-xs text-muted-foreground">
                  {new Date(event.date).toLocaleString("en-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {isActive && meta.hint && (
                <p className="mt-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-xs text-foreground">
                  {meta.hint}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
