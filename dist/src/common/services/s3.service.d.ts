import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private s3;
    private bucketName;
    private region;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        key: string;
    }>;
    deleteFile(key: string): Promise<void>;
    generateSignedUrl(key: string, expiresIn?: number): string;
}
