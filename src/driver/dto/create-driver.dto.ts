import { IsEmail, IsNotEmpty, MinLength, IsBoolean, IsOptional, Matches, IsNumber, IsArray } from 'class-validator';

export class CreateDriverDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  driverLicenseNumber: string;

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

  // Optional initial location fields
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };

  @IsOptional()
  address?: string;

  @IsOptional()
  operatingArea?: string;
}
