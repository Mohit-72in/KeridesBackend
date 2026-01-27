import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import path from 'path';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION') || '',
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
            },
        });

        if (!this.bucketName) {
            throw new Error('AWS_S3_BUCKET_NAME must be set in environment/config');
        }
        const region = this.configService.get<string>('AWS_REGION');
        if (!region) {
            throw new Error('AWS_REGION must be set in environment/config');
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<{ url: string; key: string }> {
        if (!file.buffer) {
            throw new Error('File buffer is missing. Ensure multer is configured with memoryStorage.');
        }

        const fileExtension = path.extname(file.originalname) || '';
        const fileName = `${uuid()}${fileExtension}`;
        const key = `${folder}/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await this.s3Client.send(command);
        } catch (err) {
            throw new Error(`Failed to upload file to S3: ${err}`);
        }
        const signedUrl = await this.generateSignedUrl(key);
        return { url: signedUrl, key };
    }

    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
    }

    async generateSignedUrl(key: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn });
    }
}