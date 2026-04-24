import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        rolePermissions: ({
            permission: {
                id: string;
                description: string | null;
                createdAt: Date;
                name: string;
                key: string;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
        _count: {
            userRoles: number;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        key: string;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        rolePermissions: ({
            permission: {
                id: string;
                description: string | null;
                createdAt: Date;
                name: string;
                key: string;
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
        description: string | null;
        createdAt: Date;
        name: string;
        key: string;
        updatedAt: Date;
    }>;
    create(dto: CreateRoleDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        key: string;
        updatedAt: Date;
    }>;
    assignPermissions(roleId: string, permissionIds: string[]): Promise<{
        rolePermissions: ({
            permission: {
                id: string;
                description: string | null;
                createdAt: Date;
                name: string;
                key: string;
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
        description: string | null;
        createdAt: Date;
        name: string;
        key: string;
        updatedAt: Date;
    }>;
}
