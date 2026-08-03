"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-8 w-8",
} as const;

const SIZE_TEXT = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export interface StarRatingProps {
  rating: number | null;
  size?: keyof typeof SIZE_CLASSES;
  /** Show the numeric value next to the stars (default true for display mode) */
  showValue?: boolean;
  /** When provided, renders an interactive setter instead of display */
  onRate?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  size = "md",
  showValue = true,
  onRate,
  className,
}: StarRatingProps) {
  // Interactive mode (setter)
  if (onRate) {
    return <InteractiveStars rating={rating ?? 0} onRate={onRate} size={size} />;
  }

  if (!rating) {
    return (
      <span className={cn("text-muted-foreground", SIZE_TEXT[size])}>
        No ratings
      </span>
    );
  }

  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            SIZE_CLASSES[size],
            star <= rounded
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-muted-foreground/30"
          )}
        />
      ))}
      {showValue && (
        <span
          className={cn("ml-1.5 font-medium text-foreground", SIZE_TEXT[size])}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

function InteractiveStars({
  rating,
  onRate,
  size = "md",
}: {
  rating: number;
  onRate: (rating: number) => void;
  size: keyof typeof SIZE_CLASSES;
}) {
  const starSize = size === "sm" ? "h-6 w-6" : SIZE_CLASSES[size];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          whileHover={{ scale: 1.2, rotate: -8 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="transition-colors focus:outline-none"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              starSize,
              star <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground"
            )}
          />
        </motion.button>
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating > 0
          ? `${RATING_LABELS[rating]} (${rating}/5)`
          : "Tap a star to rate"}
      </span>
    </div>
  );
}
