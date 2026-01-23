import { JwtService } from '@nestjs/jwt';
import { DriverService } from '../driver/driver.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateDriverDto } from '../driver/dto/create-driver.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginDriverDto } from '../driver/dto/login-driver.dto';
import { UserDocument } from '../schemas/user.schema';
import { DriverDocument } from '../schemas/driver.schema';
export declare class AuthService {
    private readonly driverService;
    private readonly userService;
    private readonly jwtService;
    constructor(driverService: DriverService, userService: UserService, jwtService: JwtService);
    registerUser(dto: CreateUserDto): Promise<{
        message: string;
        token: string;
        role: string;
        user: UserDocument;
    }>;
    registerDriver(dto: CreateDriverDto): Promise<{
        message: string;
        token: string;
        role: string;
        driver: DriverDocument;
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
}
