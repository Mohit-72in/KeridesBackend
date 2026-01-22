import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DateTransformer } from '../common/transformers/date.transformer';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    private dateTransformer: DateTransformer,
  ) { }

  // Called by AuthService while registration
  async create(dto: any): Promise<Driver> {
    const transformedDto = this.dateTransformer.transformDates(dto);
    return this.driverModel.create(transformedDto);
  }

  // Used by AuthService while login
  async findByEmail(email: string) {
    return this.driverModel.findOne({ email });
  }

  async findById(id: string) {
    return this.driverModel.findById(id).select('-password');
  }

  async updateDriver(id: string, updateDto: UpdateDriverDto) {
    const transformedDto = this.dateTransformer.transformDates(updateDto);
    return this.driverModel
      .findByIdAndUpdate(id, { $set: transformedDto }, { new: true })
      .select('-password');
  }

  async resetCollection() {
    await this.driverModel.collection.drop();
    return { message: 'Drivers collection reset successfully' };
  }

  async addDocument(
    driverId: string,
    documentData: { url: string; key: string; fileName: string; fileType: string },
  ) {
    return this.driverModel
      .findByIdAndUpdate(
        driverId,
        {
          $push: {
            documents: {
              url: documentData.url,
              key: documentData.key,
              fileName: documentData.fileName,
              fileType: documentData.fileType,
              uploadedAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .select('-password');
  }

  /**
   * EXISTING METHOD (UNCHANGED)
   * Still updates latitude / longitude
   */
  async updateDriverLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    isOnline?: boolean,
  ) {
    const updateData: any = {
      latitude,
      longitude,
      lastLocationUpdate: new Date(),
    };

    if (isOnline !== undefined) {
      updateData.isOnline = isOnline;
    }

    return this.driverModel
      .findByIdAndUpdate(driverId, { $set: updateData }, { new: true })
      .select('-password');
  }

  /**
   * ✅ NEW METHOD (ADDED)
   * Updates BOTH:
   * - old lat/lng
   * - new GeoJSON location
   */
  async updateDriverGeoLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    isOnline: boolean = true,
  ) {
    console.log(`[Driver Service] Updating location for driver ${driverId}: lat=${latitude}, lng=${longitude}`);
    
    const result = await this.driverModel
      .findByIdAndUpdate(
        driverId,
        {
          latitude,
          longitude,
          locationFieldType: 'Point',
          coordinates: [longitude, latitude], // IMPORTANT ORDER: [lng, lat]
          isOnline,
          lastLocationUpdate: new Date(),
        },
        { new: true },
      )
      .select('-password');

    console.log(`[Driver Service] Location updated result:`, {
      driverId,
      latitude: result?.latitude,
      longitude: result?.longitude,
      coordinates: result?.coordinates,
      isOnline: result?.isOnline,
    });

    return result;
  }

  /**
   * ✅ OFFLINE FIX (IMPORTANT)
   * No more latitude=0, longitude=0 bug
   */
  async goOffline(driverId: string) {
    return this.driverModel
      .findByIdAndUpdate(
        driverId,
        {
          isOnline: false,
          $unset: {
            location: '',
            coordinates: '',
            locationFieldType: '',
          },
        },
        { new: true },
      )
      .select('-password');
  }

  /**
   * EXISTING METHOD (UNCHANGED)
   * Manual Haversine logic – still supported
   */
// Configurable defaults (can be overridden with ENV)
  private static DEFAULT_NEARBY_DRIVERS_RADIUS_KM = parseFloat(process.env.NEARBY_DRIVERS_RADIUS_KM || '5');
  private static DEFAULT_NEARBY_DRIVERS_LIMIT = parseInt(process.env.NEARBY_DRIVERS_LIMIT || '10', 10);

  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm: number = DriverService.DEFAULT_NEARBY_DRIVERS_RADIUS_KM,
  ) {
    const allOnlineDrivers = await this.driverModel
      .find({
        isOnline: true,
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null },
      })
      .select('-password -documents')
      .lean();

    const nearbyDrivers = allOnlineDrivers
      .filter((driver) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          driver.latitude!,
          driver.longitude!,
        );
        return distance <= radiusKm;
      })
      .sort((a, b) => {
        const distA = this.calculateDistance(
          latitude,
          longitude,
          a.latitude!,
          a.longitude!,
        );
        const distB = this.calculateDistance(
          latitude,
          longitude,
          b.latitude!,
          b.longitude!,
        );
        return distA - distB;
      })
      .slice(0, DriverService.DEFAULT_NEARBY_DRIVERS_LIMIT);

    return nearbyDrivers;
  }

  /**
   * Public/admin-friendly listing of drivers with simple filters and pagination.
   * - returns safe fields only (no password)
   */
  async getAllDrivers(filter: { isOnline?: boolean; area?: string } = {}, page = 1, limit = DriverService.DEFAULT_NEARBY_DRIVERS_LIMIT) {
    const q: any = {};
    if (typeof filter.isOnline === 'boolean') q.isOnline = filter.isOnline;
    if (filter.area) q.operatingArea = filter.area;

    const skip = Math.max(0, (page - 1)) * limit;
    const [items, total] = await Promise.all([
      this.driverModel.find(q).select('-password -documents').skip(skip).limit(limit).lean(),
      this.driverModel.countDocuments(q),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Distance calculation (Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
