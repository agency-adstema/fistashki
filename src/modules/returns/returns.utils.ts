import { BadRequestException } from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const RETURN_STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  [ReturnStatus.REQUESTED]: [
    ReturnStatus.APPROVED,
    ReturnStatus.REJECTED,
    ReturnStatus.CANCELLED,
  ],
  [ReturnStatus.APPROVED]: [ReturnStatus.RECEIVED, ReturnStatus.CANCELLED],
  [ReturnStatus.RECEIVED]: [
    ReturnStatus.REFUND_PENDING,
    ReturnStatus.REFUNDED,
    ReturnStatus.COMPLETED,
  ],
  [ReturnStatus.REFUND_PENDING]: [ReturnStatus.REFUNDED],
  [ReturnStatus.REFUNDED]: [ReturnStatus.COMPLETED],
  [ReturnStatus.REJECTED]: [],
  [ReturnStatus.COMPLETED]: [],
  [ReturnStatus.CANCELLED]: [],
};

export function assertReturnStatusTransition(
  from: ReturnStatus,
  to: ReturnStatus,
): void {
  const allowed = RETURN_STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid return status transition: ${from} → ${to}. Allowed: ${allowed.join(', ') || 'none'}`,
    );
  }
}

export interface ReturnItemCheck {
  orderItemId: string;
  quantity: number;
}

export interface OrderItemInfo {
  id: string;
  quantity: number;
}

export interface ExistingReturnItemInfo {
  orderItemId: string;
  quantity: number;
}

export function validateReturnQuantities(
  newItems: ReturnItemCheck[],
  orderItems: OrderItemInfo[],
  existingReturnItems: ExistingReturnItemInfo[],
): string[] {
  const errors: string[] = [];

  for (const newItem of newItems) {
    const orderItem = orderItems.find((oi) => oi.id === newItem.orderItemId);
    if (!orderItem) {
      errors.push(`Order item ${newItem.orderItemId} not found on this order`);
      continue;
    }

    const alreadyReturned = existingReturnItems
      .filter((ri) => ri.orderItemId === newItem.orderItemId)
      .reduce((sum, ri) => sum + ri.quantity, 0);

    const total = newItem.quantity + alreadyReturned;
    if (total > orderItem.quantity) {
      errors.push(
        `Return quantity ${total} exceeds ordered quantity ${orderItem.quantity} for order item ${newItem.orderItemId}`,
      );
    }
  }

  return errors;
}

export function calculateReturnTotal(
  items: Array<{ totalAmount: Prisma.Decimal | number | string }>,
): Prisma.Decimal {
  return items.reduce(
    (sum, item) => sum.add(new Prisma.Decimal(item.totalAmount.toString())),
    new Prisma.Decimal(0),
  );
}
