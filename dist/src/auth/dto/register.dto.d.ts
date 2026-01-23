export declare class RegisterDto {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    agreement: boolean;
    role: 'USER' | 'DRIVER';
    phone?: string;
    licenseNumber?: string;
}
