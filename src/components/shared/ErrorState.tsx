import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Minimal variant without the Card wrapper / large icon */
  compact?: boolean;
  className?: string;
}

/**
 * Consistent error-state block for failed data fetches.
 * Shows an alert icon, message, and optional "Try Again" button.
 */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
  compact,
  className,
}: ErrorStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-12",
        className
      )}
    >
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      )}
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );

  if (compact) return content;
  return <Card>{<CardContent>{content}</CardContent>}</Card>;
}
