import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AssignCustomerDto } from './dto/assign-customer.dto';
import { AssignShippingMethodDto } from './dto/assign-shipping-method.dto';
import { AssignPaymentMethodDto } from './dto/assign-payment-method.dto';
import { ApplyCouponDto } from '../coupons/dto/apply-coupon.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CartsQueryDto } from './dto/carts-query.dto';
export declare class CartsService {
    private readonly prisma;
    private readonly auditLogsService;
    private readonly couponsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService, couponsService: CouponsService);
    private resolvePublicAssetUrl;
    private formatProductForCart;
    private formatCart;
    private assertCartEditable;
    private recomputeAndSave;
    create(dto: CreateCartDto, actorUserId?: string): Promise<any>;
    findAll(query: CartsQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findById(id: string): Promise<any>;
    findBySessionId(sessionId: string): Promise<any>;
    addItem(cartId: string, dto: AddCartItemDto, actorUserId?: string): Promise<any>;
    updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto, actorUserId?: string): Promise<any>;
    removeItem(cartId: string, itemId: string, actorUserId?: string): Promise<any>;
    clearItems(cartId: string, actorUserId?: string): Promise<any>;
    assignCustomer(cartId: string, dto: AssignCustomerDto, actorUserId?: string): Promise<any>;
    assignShippingMethod(cartId: string, dto: AssignShippingMethodDto, actorUserId?: string): Promise<any>;
    applyCoupon(cartId: string, dto: ApplyCouponDto, actorUserId?: string): Promise<any>;
    removeCoupon(cartId: string, actorUserId?: string): Promise<any>;
    assignPaymentMethod(cartId: string, dto: AssignPaymentMethodDto, actorUserId?: string): Promise<any>;
    checkout(cartId: string, dto: CheckoutDto, actorUserId?: string): Promise<{
        order: any;
        payment: any;
    }>;
    private resolveProvider;
}
