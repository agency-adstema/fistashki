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
