"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Tiny blurred placeholder for blur-up loading.
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="100%" height="100%" fill="#e2e8f0"/></svg>'
  );

function getInitials(name?: string): string {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  /** Extra classes applied only to the fallback initials badge. */
  fallbackClassName?: string;
}

/**
 * Avatar with initials fallback + blur-up loading.
 * Renders next/image when a src is available, otherwise a colored initials badge.
 */
export function UserAvatar({ src, name, className, fallbackClassName }: UserAvatarProps) {
  const [error, setError] = useState(false);
  const showImage = !!src && !error;
  const initials = getInitials(name);

  return (
    <Avatar className={className}>
      {showImage && (
        <Image
          src={src!}
          alt={name || "avatar"}
          fill
          sizes="96px"
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          onError={() => setError(true)}
        />
      )}
      <AvatarFallback className={cn("bg-primary/10 text-primary font-semibold", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
