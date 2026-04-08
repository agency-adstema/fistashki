import { BadRequestException } from '@nestjs/common';
import { ShipmentStatus, FulfillmentStatus } from '@prisma/client';
import {
  assertShipmentStatusTransition,
  computeOrderFulfillmentStatus,
} from './shipping.utils';

describe('assertShipmentStatusTransition', () => {
  it('allows PENDING → READY_TO_SHIP', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.PENDING, ShipmentStatus.READY_TO_SHIP),
    ).not.toThrow();
  });

  it('allows READY_TO_SHIP → SHIPPED', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.READY_TO_SHIP, ShipmentStatus.SHIPPED),
    ).not.toThrow();
  });

  it('allows SHIPPED → IN_TRANSIT', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT),
    ).not.toThrow();
  });

  it('allows IN_TRANSIT → DELIVERED', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED),
    ).not.toThrow();
  });

  it('allows IN_TRANSIT → RETURNED', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.IN_TRANSIT, ShipmentStatus.RETURNED),
    ).not.toThrow();
  });

  it('allows PENDING → CANCELLED', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.PENDING, ShipmentStatus.CANCELLED),
    ).not.toThrow();
  });

  it('rejects DELIVERED → SHIPPED', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.DELIVERED, ShipmentStatus.SHIPPED),
    ).toThrow(BadRequestException);
  });

  it('rejects CANCELLED → SHIPPED', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.CANCELLED, ShipmentStatus.SHIPPED),
    ).toThrow(BadRequestException);
  });

  it('rejects PENDING → DELIVERED (skipping steps)', () => {
    expect(() =>
      assertShipmentStatusTransition(ShipmentStatus.PENDING, ShipmentStatus.DELIVERED),
    ).toThrow(BadRequestException);
  });
});

describe('computeOrderFulfillmentStatus', () => {
  const s = (status: ShipmentStatus) => ({ status });

  it('returns FULFILLED when all shipments are delivered', () => {
    expect(
      computeOrderFulfillmentStatus([s(ShipmentStatus.DELIVERED), s(ShipmentStatus.DELIVERED)]),
    ).toBe(FulfillmentStatus.FULFILLED);
  });

  it('returns PARTIALLY_FULFILLED when any shipment is shipped', () => {
    expect(
      computeOrderFulfillmentStatus([s(ShipmentStatus.SHIPPED), s(ShipmentStatus.PENDING)]),
    ).toBe(FulfillmentStatus.PARTIALLY_FULFILLED);
  });

  it('returns RETURNED when all active shipments are returned/delivered/lost', () => {
    expect(
      computeOrderFulfillmentStatus([s(ShipmentStatus.RETURNED), s(ShipmentStatus.LOST)]),
    ).toBe(FulfillmentStatus.RETURNED);
  });

  it('returns null when all shipments are cancelled', () => {
    expect(
      computeOrderFulfillmentStatus([s(ShipmentStatus.CANCELLED)]),
    ).toBeNull();
  });

  it('returns null for empty list', () => {
    expect(computeOrderFulfillmentStatus([])).toBeNull();
  });

  it('ignores cancelled shipments when computing status', () => {
    expect(
      computeOrderFulfillmentStatus([
        s(ShipmentStatus.DELIVERED),
        s(ShipmentStatus.CANCELLED),
      ]),
    ).toBe(FulfillmentStatus.FULFILLED);
  });
});
