import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): Promise<{
        message: string;
        data: {
            description: string | null;
            id: string;
            name: string;
            key: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    findOne(id: string): Promise<{
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
}
