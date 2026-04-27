import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        rolePermissions: ({
            permission: {
                description: string | null;
                id: string;
                name: string;
                key: string;
                createdAt: Date;
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
        description: string | null;
        id: string;
        name: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        rolePermissions: ({
            permission: {
                description: string | null;
                id: string;
                name: string;
                key: string;
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
        description: string | null;
        id: string;
        name: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateRoleDto): Promise<{
        description: string | null;
        id: string;
        name: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignPermissions(roleId: string, permissionIds: string[]): Promise<{
        rolePermissions: ({
            permission: {
                description: string | null;
                id: string;
                name: string;
                key: string;
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
        description: string | null;
        id: string;
        name: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
