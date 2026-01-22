import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';

export class UpdateDriverDto {

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  agreement?: boolean;

  @IsOptional()
  personalInfo?: {
    bloodGroup?: string;
    certificates?: string[];
    dob?: string; // DD/MM/YYYY format
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    languages?: string[];
  };

  @IsOptional()
  drivingExperience?: {
    yearsOfExperience?: number;
    licensedSince?: string; // DD/MM/YYYY format
    totalTripsCompleted?: number;
    averageRating?: number;
  };
}
