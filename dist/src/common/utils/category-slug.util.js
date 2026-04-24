"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUuidLike = isUuidLike;
exports.expandPublicCategorySlugVariants = expandPublicCategorySlugVariants;
function isUuidLike(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}
function expandPublicCategorySlugVariants(raw) {
    const s = raw.trim();
    if (!s)
        return [];
    const out = new Set([s, s.toLowerCase(), s.toUpperCase()]);
    const latinic = s
        .replace(/Dž|dž/gi, 'dz')
        .replace(/đ/gi, 'dj')
        .replace(/Ć|ć/g, 'c')
        .replace(/Č|č/g, 'c')
        .replace(/Š|š/g, 's')
        .replace(/Ž|ž/g, 'z');
    for (const v of [latinic, latinic.toLowerCase()])
        out.add(v);
    const stripped = s.normalize('NFD').replace(/\p{M}/gu, '');
    out.add(stripped);
    out.add(stripped.toLowerCase());
    return [...out].filter((x) => x.length > 0);
}
//# sourceMappingURL=category-slug.util.js.map