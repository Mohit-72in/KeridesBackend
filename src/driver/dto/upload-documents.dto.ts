import { IsString, IsOptional } from 'class-validator';

export class UploadDocumentsDto {
    @IsOptional()
    @IsString()
    drivingLicense?: string;

    @IsOptional()
    @IsString()
    insuranceProof?: string;

    @IsOptional()
    @IsString()
    addressProof?: string;

    @IsOptional()
    @IsString()
    policeCertificate?: string;
}

export class UploadDocumentResponseDto {
    drivingLicense?: string;
    insuranceProof?: string;
    addressProof?: string;
    policeCertificate?: string;
}
