import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    login(dto: LoginDto): Promise<{
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
    }>;
    me(userId: string, restaurantId: string): Promise<{
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
    }>;
}
