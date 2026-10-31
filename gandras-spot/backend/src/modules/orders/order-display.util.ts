import { endOfMonth, startOfMonth } from 'date-fns';

/** Format: MM-NNN e.g. 07-001 */
export function formatOrderDisplayRef(date: Date, monthlySequence: number): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(monthlySequence).padStart(3, '0');
  return `${mm}-${seq}`;
}

export function orderDisplayId(displayRef: string | null | undefined, orderNumber: number): string {
  return displayRef ?? `#${orderNumber}`;
}
