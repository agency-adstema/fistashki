import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from '../../common/decorators/auth.decorators';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string | null;
                role: import(".prisma/client").$Enums.UserRole;
                restaurant: {
                    id: string;
                    name: string;
                    slug: string;
                };
            };
        };
    }>;
    me(user: AuthUser): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            firstName: string;
            lastName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            restaurant: {
                id: string;
                slug: string;
                name: string;
                logoUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
}
