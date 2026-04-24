import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            isActive: boolean;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userRoles: ({
                role: {
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
                userId: string;
            })[];
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            isActive: boolean;
        }[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
            userRoles: ({
                role: {
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
        };
    }>;
}
