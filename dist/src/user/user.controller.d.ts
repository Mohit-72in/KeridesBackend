import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { S3Service } from '../common/services/s3.service';
export declare class UserController {
    private readonly userService;
    private readonly s3Service;
    constructor(userService: UserService, s3Service: S3Service);
    profile(req: any): Promise<{
        id: import("mongoose").Types.ObjectId;
        fullName: string;
        email: string;
        phoneNumber: string;
        address: string | undefined;
        profileImage: string | undefined;
        role: string;
    }>;
    update(req: any, dto: UpdateUserDto): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/user.schema").UserDocument, {}, {}> & import("../schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    uploadDocument(req: any, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
        key: string;
        size: number;
        type: string;
        user: (import("mongoose").Document<unknown, {}, import("../schemas/user.schema").UserDocument, {}, {}> & import("../schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
}
