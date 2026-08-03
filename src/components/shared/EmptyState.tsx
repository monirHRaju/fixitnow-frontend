import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  /** Right/action content (e.g. a Button) */
  action?: React.ReactNode;
  /** Compact variant just centers text (no large icon/title) */
  compact?: boolean;
  className?: string;
}

/**
 * Consistent empty-state block for lists/tables with no data.
 * Rich variant: icon + title + description + optional CTA.
 * Compact variant: centered text only.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
  className,
}: EmptyStateProps) {
  if (compact) {
    return (
      <p className={cn("text-sm text-muted-foreground text-center", className)}>
        {title || description}
      </p>
    );
  }
  return (
    <Card className={cn("border-none shadow-none", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground/30" />
        )}
        {title && <h3 className="mt-4 text-lg font-medium">{title}</h3>}
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
