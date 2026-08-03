import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-side actions (e.g. Button/Link) */
  action?: React.ReactNode;
  /** Visual size: compact (h2, 2xl) vs large (h1, 3xl) */
  size?: "sm" | "lg";
  /** Animate fade-in */
  animate?: boolean;
  className?: string;
}

/**
 * Consistent page header (title + optional description + optional action).
 */
export function PageHeader({
  title,
  description,
  action,
  size = "lg",
  animate = true,
  className,
}: PageHeaderProps) {
  const header = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div>
        <h1
          className={cn(
            "font-bold tracking-tight",
            size === "lg" ? "text-2xl sm:text-3xl" : "text-2xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );

  if (!animate) return header;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {header}
    </motion.div>
  );
}
