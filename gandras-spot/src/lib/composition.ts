/** Sastav iz admin polja (description) — redovi ili zarezi */
export function parseCompositionText(text?: string | null): string[] {
  if (!text?.trim()) return [];
  const raw = text.trim();
  if (raw.includes("\n")) {
    return raw
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw
    .split(/\s*·\s*|,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}
