/** Minutes remaining until `readyAt` (0 when overdue). */
export function minutesUntil(readyAt: string | null | undefined): number | null {
  if (!readyAt) return null;
  const diff = new Date(readyAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 60_000));
}

/**
 * Remaining minutes for a single order.
 * Caps by `estimatedMinutes` so a wrong/cross-order `readyAt` cannot inflate the UI
 * (accept always stores readyAt = acceptedAt + estimatedMinutes).
 */
export function orderMinutesLeft(
  readyAt: string | null | undefined,
  estimatedMinutes?: number | null,
): number | null {
  const left = minutesUntil(readyAt);
  if (left == null) return null;
  if (typeof estimatedMinutes === "number" && estimatedMinutes > 0) {
    return Math.min(left, estimatedMinutes);
  }
  return left;
}


export function buildGoogleMapsUrl(address?: string | null, city?: string | null): string | null {
  const parts = [address, city].filter(Boolean).join(", ");
  if (!parts.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
}

/** Embedded directions map: origin (restaurant) → destination (customer). */
export function buildGoogleMapsDirectionsEmbedUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    output: "embed",
    hl: "sr",
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

/**
 * Opens Google Maps (app on phone) with driving directions already set.
 * On mobile → Maps app / navigation; on desktop → Maps in browser.
 */
export function buildGoogleMapsNavigationUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
    dir_action: "navigate",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
