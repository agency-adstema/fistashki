import { UserRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    restaurantId: string;
    role: UserRole;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const RestaurantId: (...dataOrPipes: unknown[]) => ParameterDecorator;
