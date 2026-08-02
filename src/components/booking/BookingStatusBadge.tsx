import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type BookingStatusLabel = string;

export interface StatusMeta {
  label: string;
  hint: string;
  color: string;
  dot: string;
}

/**
 * Centralized booking-status metadata.
 * `color` = badge + light-wash background classes.
 * `dot`   = solid accent used by the timeline.
 * `hint`  = actionable guidance shown to the user for the current status.
 */
export const BOOKING_STATUS_META: Record<string, StatusMeta> = {
  REQUESTED: {
    label: "Requested",
    hint: "Waiting for the technician to accept your booking.",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-900",
    dot: "bg-yellow-500",
  },
  ACCEPTED: {
    label: "Accepted",
    hint: "The technician accepted your booking. Pay now to confirm it.",
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-900",
    dot: "bg-blue-500",
  },
  DECLINED: {
    label: "Declined",
    hint: "The technician declined this booking. Try booking another technician.",
    color:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-900",
    dot: "bg-red-500",
  },
  PAID: {
    label: "Paid",
    hint: "Payment confirmed. The technician has been notified.",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-900",
    dot: "bg-green-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    hint: "The technician is working on your service now.",
    color:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-900",
    dot: "bg-purple-500",
  },
  COMPLETED: {
    label: "Completed",
    hint: "The job is done. Leave a review to share your experience.",
    color:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    hint: "This booking was cancelled.",
    color:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-800",
    dot: "bg-gray-400",
  },
  PENDING: {
    label: "Pending",
    hint: "Payment is pending.",
    color:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-900",
    dot: "bg-amber-500",
  },
  FAILED: {
    label: "Failed",
    hint: "Payment failed. Please try again.",
    color:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-900",
    dot: "bg-rose-500",
  },
};

export function getStatusMeta(status: string): StatusMeta {
  return (
    BOOKING_STATUS_META[status] || {
      label: status,
      hint: "",
      color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400",
      dot: "bg-gray-400",
    }
  );
}

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Color-coded badge for a booking/payment status.
 * Yellow=requested, blue=accepted, red=declined, purple=in progress,
 * green=paid, emerald=completed, grey=cancelled, rose=failed.
 */
export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const meta = getStatusMeta(status);
  return (
    <Badge variant="outline" className={cn("border", meta.color, className)}>
      {meta.label}
    </Badge>
  );
}
