/** Clean phone for tel: links (keeps leading +, strips spaces/dashes). */
export function toTelHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned || cleaned === "+") return null;
  return `tel:${cleaned}`;
}
