import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            user: {
                role: {
                    id: string;
                    key: string;
                    name: string;
                } & {
                    id: string;
                    name: string;
                    key: string;
                };
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                isActive: boolean;
            };
        };
    }>;
    me(user: any): Promise<{
        message: string;
        data: any;
    }>;
}
