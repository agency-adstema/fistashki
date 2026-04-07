import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): Promise<{
        message: string;
        data: {
            id: string;
            key: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
            id: string;
            key: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
