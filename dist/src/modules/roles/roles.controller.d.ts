import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    create(dto: CreateRoleDto): Promise<{
        message: string;
        data: {
            description: string | null;
            id: string;
            name: string;
            key: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    assignPermissions(id: string, dto: AssignPermissionsDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
}
