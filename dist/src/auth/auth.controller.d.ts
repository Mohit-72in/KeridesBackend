import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateDriverDto } from '../driver/dto/create-driver.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginDriverDto } from '../driver/dto/login-driver.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    registerUser(dto: CreateUserDto): Promise<{
        message: string;
        token: string;
        role: string;
        user: import("../schemas/user.schema").UserDocument;
    }>;
    registerDriver(dto: CreateDriverDto): Promise<{
        message: string;
        token: string;
        role: string;
        driver: import("../schemas/driver.schema").DriverDocument;
    }>;
    loginUser(dto: LoginUserDto): Promise<{
        message: string;
        token: string;
        role: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            fullName: string;
            email: string;
        };
    }>;
    loginDriver(dto: LoginDriverDto): Promise<{
        message: string;
        token: string;
        role: string;
        driver: {
            id: import("mongoose").Types.ObjectId;
            fullName: string;
            email: string;
            phoneNumber: string;
            driverLicenseNumber: string;
        };
    }>;
    debugVerifyToken(token: string, authHeader?: string): Promise<{
        valid: boolean;
        payload: any;
        fingerprints: {
            verify: any;
        };
        tokenPrefix: string;
        error?: undefined;
    } | {
        valid: boolean;
        error: any;
        fingerprints: {
            verify: any;
        };
        tokenPrefix: string;
        payload?: undefined;
    }>;
}
