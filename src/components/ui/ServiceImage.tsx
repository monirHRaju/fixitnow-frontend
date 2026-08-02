"use client";

import { useState } from "react";
import Image from "next/image";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

// A tiny 1x1 blurred placeholder used for blur-up loading.
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="100%" height="100%" fill="#e2e8f0"/></svg>'
  );

interface ServiceImageProps {
  src?: string | null;
  alt?: string;
  /** Title/name used for the initials fallback when no image is available. */
  fallbackLabel?: string;
  /** Rendering style of the image. */
  variant?: "cover" | "avatar";
  className?: string;
  /** For avatars — render a perfect circle. */
  rounded?: boolean;
}

/**
 * Wrapper around next/image that:
 *  - falls back to an initials / icon placeholder when no src or on load error
 *  - uses blur-up placeholder while loading
 */
export function ServiceImage({
  src,
  alt = "",
  fallbackLabel,
  variant = "cover",
  className,
  rounded = false,
}: ServiceImageProps) {
  const [error, setError] = useState(false);
  const showImage = !!src && !error;

  const initials =
    (fallbackLabel || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (!showImage) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          rounded ? "rounded-full" : "rounded-xl",
          className
        )}
      >
        {initials ? (
          <span className="font-semibold">{initials}</span>
        ) : (
          <Wrench className="h-1/2 w-1/2" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        rounded ? "rounded-full" : "rounded-xl",
        className
      )}
    >
      <Image
        src={src!}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className={cn(
          "object-cover",
          variant === "avatar" && "object-center"
        )}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        onError={() => setError(true)}
      />
    </div>
  );
}
