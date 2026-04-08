import { BadRequestException } from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import {
  assertReturnStatusTransition,
  calculateReturnTotal,
  validateReturnQuantities,
  RETURN_STATUS_TRANSITIONS,
} from './returns.utils';

describe('RETURN_STATUS_TRANSITIONS', () => {
  it('defines transitions for all statuses', () => {
    const statuses = Object.values(ReturnStatus);
    statuses.forEach((s) => {
      expect(RETURN_STATUS_TRANSITIONS[s]).toBeDefined();
    });
  });
});

describe('assertReturnStatusTransition', () => {
  it('allows REQUESTED → APPROVED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REQUESTED, ReturnStatus.APPROVED),
    ).not.toThrow();
  });

  it('allows REQUESTED → REJECTED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REQUESTED, ReturnStatus.REJECTED),
    ).not.toThrow();
  });

  it('allows REQUESTED → CANCELLED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REQUESTED, ReturnStatus.CANCELLED),
    ).not.toThrow();
  });

  it('allows APPROVED → RECEIVED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.APPROVED, ReturnStatus.RECEIVED),
    ).not.toThrow();
  });

  it('allows RECEIVED → REFUND_PENDING', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.RECEIVED, ReturnStatus.REFUND_PENDING),
    ).not.toThrow();
  });

  it('allows RECEIVED → REFUNDED (skip REFUND_PENDING)', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.RECEIVED, ReturnStatus.REFUNDED),
    ).not.toThrow();
  });

  it('allows RECEIVED → COMPLETED (skip refund entirely)', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.RECEIVED, ReturnStatus.COMPLETED),
    ).not.toThrow();
  });

  it('allows REFUND_PENDING → REFUNDED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REFUND_PENDING, ReturnStatus.REFUNDED),
    ).not.toThrow();
  });

  it('allows REFUNDED → COMPLETED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REFUNDED, ReturnStatus.COMPLETED),
    ).not.toThrow();
  });

  it('rejects REQUESTED → RECEIVED (skip APPROVED)', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REQUESTED, ReturnStatus.RECEIVED),
    ).toThrow(BadRequestException);
  });

  it('rejects REQUESTED → COMPLETED', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REQUESTED, ReturnStatus.COMPLETED),
    ).toThrow(BadRequestException);
  });

  it('rejects REJECTED → anything', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.REJECTED, ReturnStatus.APPROVED),
    ).toThrow(BadRequestException);
  });

  it('rejects COMPLETED → anything', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.COMPLETED, ReturnStatus.REFUNDED),
    ).toThrow(BadRequestException);
  });

  it('rejects CANCELLED → anything', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.CANCELLED, ReturnStatus.REQUESTED),
    ).toThrow(BadRequestException);
  });

  it('rejects APPROVED → REFUNDED (must receive first)', () => {
    expect(() =>
      assertReturnStatusTransition(ReturnStatus.APPROVED, ReturnStatus.REFUNDED),
    ).toThrow(BadRequestException);
  });
});

describe('validateReturnQuantities', () => {
  const orderItems = [
    { id: 'oi-1', quantity: 5 },
    { id: 'oi-2', quantity: 3 },
  ];

  it('returns no errors when quantities are within limits', () => {
    const errors = validateReturnQuantities(
      [{ orderItemId: 'oi-1', quantity: 2 }],
      orderItems,
      [],
    );
    expect(errors).toHaveLength(0);
  });

  it('returns no errors for exact match', () => {
    const errors = validateReturnQuantities(
      [{ orderItemId: 'oi-1', quantity: 5 }],
      orderItems,
      [],
    );
    expect(errors).toHaveLength(0);
  });

  it('returns error when return quantity exceeds ordered quantity', () => {
    const errors = validateReturnQuantities(
      [{ orderItemId: 'oi-1', quantity: 6 }],
      orderItems,
      [],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('oi-1');
  });

  it('accounts for existing return items from other requests', () => {
    const errors = validateReturnQuantities(
      [{ orderItemId: 'oi-1', quantity: 3 }],
      orderItems,
      [{ orderItemId: 'oi-1', quantity: 3 }],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('6');
  });

  it('passes when existing + new = ordered quantity exactly', () => {
    const errors = validateReturnQuantities(
      [{ orderItemId: 'oi-2', quantity: 1 }],
      orderItems,
      [{ orderItemId: 'oi-2', quantity: 2 }],
    );
    expect(errors).toHaveLength(0);
  });

  it('returns error for unknown order item id', () => {
    const errors = validateReturnQuantities(
      [{ orderItemId: 'oi-999', quantity: 1 }],
      orderItems,
      [],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('oi-999');
  });

  it('handles multiple items with mixed results', () => {
    const errors = validateReturnQuantities(
      [
        { orderItemId: 'oi-1', quantity: 2 },
        { orderItemId: 'oi-2', quantity: 10 },
      ],
      orderItems,
      [],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('oi-2');
  });
});

describe('calculateReturnTotal', () => {
  it('returns 0 for empty array', () => {
    expect(calculateReturnTotal([]).toNumber()).toBe(0);
  });

  it('sums a single item', () => {
    expect(
      calculateReturnTotal([{ totalAmount: new Prisma.Decimal('25.50') }]).toNumber(),
    ).toBe(25.5);
  });

  it('sums multiple items correctly', () => {
    const items = [
      { totalAmount: new Prisma.Decimal('10.00') },
      { totalAmount: new Prisma.Decimal('15.50') },
      { totalAmount: new Prisma.Decimal('4.50') },
    ];
    expect(calculateReturnTotal(items).toNumber()).toBe(30);
  });

  it('handles numeric totalAmount', () => {
    expect(calculateReturnTotal([{ totalAmount: 19.99 }]).toNumber()).toBe(19.99);
  });

  it('handles string totalAmount', () => {
    expect(calculateReturnTotal([{ totalAmount: '100.00' }]).toNumber()).toBe(100);
  });
});
