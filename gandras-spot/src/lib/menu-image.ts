/** Next/Image: uploaded menu photos live outside /public */
export function imageNeedsUnoptimized(src?: string | null): boolean {
  return Boolean(src?.startsWith("/uploads/"));
}
