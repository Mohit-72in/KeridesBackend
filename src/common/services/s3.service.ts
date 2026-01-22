import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
    private s3: AWS.S3;
    private bucketName: string;
    private region: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
        this.region = this.configService.get<string>('AWS_REGION') || '';

        this.s3 = new AWS.S3({
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            region: this.region,
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<{ url: string; key: string }> {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Allowed: PDF, JPG, JPEG, PNG');
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        // Generate unique key
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${uuid()}.${fileExtension}`;
        const key = `${folder}/${fileName}`;

        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private',
        };

        try {
            await this.s3.putObject(params).promise();

            // Generate signed URL valid for 7 days
            const signedUrl = this.s3.getSignedUrl('getObject', {
                Bucket: this.bucketName,
                Key: key,
                Expires: 7 * 24 * 60 * 60, // 7 days
            });

            return { url: signedUrl, key };
        } catch (error) {
            throw new Error(`S3 upload failed: ${error.message}`);
        }
    }
    async deleteFile(key: string): Promise<void> {
        const params = {
            Bucket: this.bucketName,
            Key: key,
        };

        try {
            await this.s3.deleteObject(params).promise();
        } catch (error) {
            throw new Error(`S3 delete failed: ${error.message}`);
        }
    }

    generateSignedUrl(key: string, expiresIn: number = 7 * 24 * 60 * 60): string {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: expiresIn,
        });
    }
}
