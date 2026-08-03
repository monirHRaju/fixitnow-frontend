import { cn, getStatusColor, formatLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface StatusBadgeProps {
  status: string;
  className?: string;
  /** Override the displayed label (default: humanized status) */
  label?: string;
  variant?: "outline" | "default" | "secondary" | "destructive";
}

/**
 * Color-coded badge for booking/payment/user statuses.
 * Color mapping comes from shared `getStatusColor` in utils; label is
 * humanized by default (e.g. "IN_PROGRESS" -> "In Progress").
 */
export function StatusBadge({
  status,
  className,
  label,
  variant = "outline",
}: StatusBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(getStatusColor(status), className)}
    >
      {label ?? formatLabel(status)}
    </Badge>
  );
}
