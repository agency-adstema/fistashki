"use client";

import { useEffect, useState } from "react";
import { minutesUntil, orderMinutesLeft } from "@/lib/countdown";

export function useCountdownMinutes(
  readyAt: string | null | undefined,
  estimatedMinutes?: number | null,
) {
  const [minutes, setMinutes] = useState<number | null>(() =>
    estimatedMinutes != null && estimatedMinutes > 0
      ? orderMinutesLeft(readyAt, estimatedMinutes)
      : minutesUntil(readyAt),
  );

  useEffect(() => {
    const tick = () =>
      setMinutes(
        estimatedMinutes != null && estimatedMinutes > 0
          ? orderMinutesLeft(readyAt, estimatedMinutes)
          : minutesUntil(readyAt),
      );
    tick();
    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, [readyAt, estimatedMinutes]);

  return minutes;
}
