import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    findById(id: string): Promise<{
        userRoles: ({
            role: {
                rolePermissions: ({
                    permission: {
                        id: string;
                        key: string;
                        name: string;
                        description: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    roleId: string;
                    permissionId: string;
                })[];
            } & {
                id: string;
                key: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            userId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    } | null>;
    findByEmailWithPassword(email: string): Promise<({
        userRoles: ({
            role: {
                id: string;
                key: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }) | null>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userRoles: ({
            role: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            userId: string;
        })[];
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        userRoles: ({
            role: {
                rolePermissions: ({
                    permission: {
                        id: string;
                        key: string;
                        name: string;
                        description: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    roleId: string;
                    permissionId: string;
                })[];
            } & {
                id: string;
                key: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            userId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
}
