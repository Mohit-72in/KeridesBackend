import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true })
export class Driver {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  driverLicenseNumber: string;

  @Prop()
  address?: string;

  @Prop()
  profileImage?: string;

  @Prop({
    type: {
      bloodGroup: String,
      certificates: [String],
      dob: Date,
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      },
      languages: [String],
    },
    default: {},
  })
  personalInfo: {
    bloodGroup?: string;
    certificates?: string[];
    dob?: Date;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    languages?: string[];
  };

  @Prop({
    type: {
      yearsOfExperience: Number,
      licensedSince: Date,
      totalTripsCompleted: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    default: {},
  })
  drivingExperience: {
    yearsOfExperience?: number;
    licensedSince?: Date;
    totalTripsCompleted?: number;
    averageRating?: number;
  };

  @Prop({
    type: [
      {
        url: String,
        key: String,
        uploadedAt: { type: Date, default: Date.now },
        fileName: String,
        fileType: String,
      },
    ],
    default: [],
  })
  documents?: Array<{
    url: string;
    key: string;
    uploadedAt: Date;
    fileName: string;
    fileType: string;
  }>;

  // Operating area
  @Prop()
  operatingArea?: string;

  // OLD LAT/LNG (KEEP FOR COMPATIBILITY)
  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  // ✅ NEW GEOJSON LOCATION (PROPER FORMAT)
  @Prop({
    type: String,
    enum: ['Point'],
  })
  locationFieldType?: string;

  @Prop({
    type: [Number],
  })
  coordinates?: [number, number];

  @Prop({ default: false })
  isOnline?: boolean;

  @Prop()
  lastLocationUpdate?: Date;

  @Prop()
  busyUntil?: Date;

  @Prop({ default: 'DRIVER' })
  role: string;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

// Create geospatial index on coordinates
DriverSchema.index({ coordinates: '2dsphere' });
