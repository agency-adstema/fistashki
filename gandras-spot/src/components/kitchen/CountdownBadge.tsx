"use client";

import { useCountdownMinutes } from "@/hooks/useCountdownMinutes";
import { cn } from "@/lib/utils";

export function CountdownBadge({
  readyAt,
  className,
}: {
  readyAt: string | null | undefined;
  className?: string;
}) {
  const left = useCountdownMinutes(readyAt);
  if (left === null) return null;

  const urgent = left <= 5;

  return (
    <span
      className={cn(
        "rounded-full px-4 py-1 text-lg font-bold",
        urgent ? "bg-red-600 text-white animate-pulse" : "bg-red-600 text-white",
        className,
      )}
    >
      {left} min
    </span>
  );
}
