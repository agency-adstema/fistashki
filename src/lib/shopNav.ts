/**
 * Deljeno između Header / Footer — linkovi kategorija iz CRM (API) ili fallback.
 */

export type ShopNavLink = { title: string; href: string };

function apiBase(): string {
  try {
    const u = import.meta.env.VITE_API_URL;
    return u ? String(u).replace(/\/$/, '') : '';
  } catch {
    return '';
  }
}

export function getFallbackCategoryNavLinks(t: (key: string) => string): ShopNavLink[] {
  // Koristi srpske slug-ove iz CRM-a, ne engleske!
  return [
    { title: t('header.seeds_seedlings'), href: '/category/semena-i-sadnice' },
    { title: t('header.fertilizers'), href: '/category/djubriva' },
    { title: t('header.plant_protection'), href: '/category/zastita-biljaka' },
    { title: t('header.soil_substrates'), href: '/category/zemlja-i-supstrati' },
    { title: t('header.garden_tools'), href: '/category/alati-za-bastu' },
  ];
}

export async function fetchCategoryNavLinks(): Promise<ShopNavLink[] | null> {
  const base = apiBase();
  if (!base) {
    console.warn('[shopNav] No API base URL');
    return null;
  }
  try {
    const url = `${base}/public/categories/nav`;
    console.log('[shopNav] Fetching from', url);
    const res = await fetch(url);
    console.log('[shopNav] Response status:', res.status);
    if (!res.ok) {
      console.warn('[shopNav] API returned', res.status);
      return null;
    }
    const body = await res.json();
    console.log('[shopNav] Response body:', body);
    const items = body?.data?.items;
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[shopNav] No items in response');
      return null;
    }
    const links = items.map((c: { name: string; slug: string }) => ({
      title: c.name,
      href: `/category/${c.slug}`,
    }));
    console.log('[shopNav] Mapped', links.length, 'categories');
    return links;
  } catch (err) {
    console.error('[shopNav] Fetch failed:', err);
    return null;
  }
}
