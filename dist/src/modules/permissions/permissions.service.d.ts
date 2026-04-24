import { PrismaService } from '../../prisma/prisma.service';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        key: string;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        key: string;
        updatedAt: Date;
    }>;
}
