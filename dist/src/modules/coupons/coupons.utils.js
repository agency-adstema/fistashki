"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = calculateDiscount;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function calculateDiscount(coupon, subtotal) {
    const min = coupon.minOrderAmount != null
        ? new client_1.Prisma.Decimal(coupon.minOrderAmount)
        : null;
    if (min && subtotal.lessThan(min)) {
        throw new common_1.BadRequestException(`Minimum order amount of ${min} is required to use this coupon`);
    }
    const val = new client_1.Prisma.Decimal(coupon.value);
    let discount;
    if (coupon.type === client_1.CouponType.PERCENTAGE) {
        discount = subtotal.mul(val).div(100);
        if (coupon.maxDiscountAmount != null) {
            const cap = new client_1.Prisma.Decimal(coupon.maxDiscountAmount);
            if (discount.greaterThan(cap))
                discount = cap;
        }
    }
    else {
        discount = val;
    }
    if (discount.greaterThan(subtotal)) {
        discount = subtotal;
    }
    return discount;
}
//# sourceMappingURL=coupons.utils.js.map