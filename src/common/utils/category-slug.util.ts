/**
 * Rešava shop URL slug (npr. djubriva) vs CRM slug sa latinicom (đubriva).
 */
export function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/** UUID ili Prisma `cuid()` — frontend šalje `category.id` iz javnog odgovora (nije UUID v4). */
export function isPublicCategoryIdParam(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (isUuidLike(v)) return true;
  return /^c[a-z0-9]{24}$/i.test(v);
}

/** Varijante za Prisma slug pretragu (ascii/diakritika, velika/mala slova). */
export function expandPublicCategorySlugVariants(raw: string): string[] {
  const s = raw.trim();
  if (!s) return [];
  const out = new Set<string>([s, s.toLowerCase(), s.toUpperCase()]);
  const latinic = s
    .replace(/Dž|dž/gi, 'dz')
    .replace(/đ/gi, 'dj')
    .replace(/Ć|ć/g, 'c')
    .replace(/Č|č/g, 'c')
    .replace(/Š|š/g, 's')
    .replace(/Ž|ž/g, 'z');
  for (const v of [latinic, latinic.toLowerCase()]) out.add(v);
  const stripped = s.normalize('NFD').replace(/\p{M}/gu, '');
  out.add(stripped);
  out.add(stripped.toLowerCase());

  // Obrnuto od đ→dj: URL često šalje ASCII "dj" dok je u CRM-u slug sa "đ" (npr. djubriva vs đubriva).
  if (/dj/i.test(s)) {
    const withDjAsDj = s.replace(/dj/gi, 'đ');
    if (withDjAsDj !== s) {
      out.add(withDjAsDj);
      out.add(withDjAsDj.toLowerCase());
      out.add(withDjAsDj.toUpperCase());
    }
  }

  return [...out].filter((x) => x.length > 0);
}
