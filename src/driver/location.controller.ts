/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleRequired } from '../common/decorators/role.decorator';
import { Role } from '../common/role.enum';

@Controller('drivers')
export class LocationController {
  private logger = new Logger('LocationController');

  constructor(private driverService: DriverService) {}

  /**
   * DRIVER: Update current location every 5–10 seconds
   * POST /drivers/location/update
   */
  @Post('location/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  async updateLocation(
    @Request() req,
    @Body() body: { latitude: number; longitude: number; isOnline?: boolean },
  ) {
    try {
      const driverId = req.user.id;
      const { latitude, longitude, isOnline } = body;

      this.logger.log(`📍 [LOCATION UPDATE] Driver ${driverId} updating location: ${latitude}, ${longitude}`);

      // ✅ Proper validation (0,0 bug removed)
      if (
        latitude === undefined ||
        longitude === undefined ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        this.logger.warn(`⚠️ [LOCATION UPDATE] Invalid coordinates received for driver ${driverId}`);
        return {
          success: false,
          message: 'Invalid coordinates',
        };
      }

      // ✅ USE GEO-AWARE METHOD
      const updatedDriver = await this.driverService.updateDriverGeoLocation(
        driverId,
        latitude,
        longitude,
        isOnline ?? true,
      );

      if (!updatedDriver) {
        this.logger.error(`❌ [LOCATION UPDATE] Failed to update driver ${driverId}`);
        return {
          success: false,
          message: 'Failed to update driver location',
        };
      }

      this.logger.log(
        `✅ [LOCATION UPDATE] Driver ${driverId} location updated: lat=${latitude}, lng=${longitude}, online=${isOnline ?? true}`,
      );

      return {
        success: true,
        message: 'Location updated successfully',
        latitude,
        longitude,
        isOnline: updatedDriver.isOnline,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('❌ Error updating driver location:', error);
      return {
        success: false,
        message: 'Failed to update location',
        error: error.message,
      };
    }
  }

  /**
   * DRIVER: Set online status
   * POST /drivers/status/online
   */
  @Post('status/online')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  async goOnline(
    @Request() req,
    @Body() body: { latitude: number; longitude: number },
  ) {
    try {
      const driverId = req.user.id;
      const { latitude, longitude } = body;

      const updatedDriver = await this.driverService.updateDriverGeoLocation(
        driverId,
        latitude,
        longitude,
        true,
      );

      if (!updatedDriver) {
        return {
          success: false,
          message: 'Failed to set driver online',
        };
      }

      this.logger.log(`✅ Driver ${driverId} is now ONLINE`);

      return {
        success: true,
        message: 'Driver is now online',
        isOnline: true,
      };
    } catch (error) {
      this.logger.error('❌ Error setting driver online:', error);
      throw error;
    }
  }

  /**
   * DRIVER: Set offline status
   * POST /drivers/status/offline
   */
  @Post('status/offline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  async goOffline(@Request() req) {
    try {
      const driverId = req.user.id;

      // ✅ Correct offline handling (NO 0,0)
      await this.driverService.goOffline(driverId);

      this.logger.log(`✅ Driver ${driverId} is now OFFLINE`);

      return {
        success: true,
        message: 'Driver is now offline',
        isOnline: false,
      };
    } catch (error) {
      this.logger.error('❌ Error setting driver offline:', error);
      throw error;
    }
  }
}
