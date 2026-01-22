import {
  Body,
  Controller,
  Patch,
  Delete,
  Post,
  Get,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriverService } from './driver.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleRequired } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { S3Service } from '../common/services/s3.service';
import { DriverNotificationService } from '../common/services/driver-notification.service';

@Controller('drivers')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly s3Service: S3Service,
    private readonly notificationService: DriverNotificationService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  @Get('profile')
  profile(@Request() req) {
    return this.driverService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  @Patch('update')
  updateDriver(@Request() req, @Body() updateDto: UpdateDriverDto) {
    return this.driverService.updateDriver(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  @Post('upload-document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const { url, key } = await this.s3Service.uploadFile(
        file,
        `drivers/${req.user.id}/documents`,
      );

      // Save document to database
      const updatedDriver = await this.driverService.addDocument(req.user.id, {
        url,
        key,
        fileName: file.originalname,
        fileType: file.mimetype,
      });

      return {
        message: 'Document uploaded successfully',
        url,
        key,
        size: file.size,
        type: file.mimetype,
        driver: updatedDriver,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('reset')
  async resetDrivers() {
    return this.driverService.resetCollection();
  }

  /**
   * Public (safe) list of drivers with optional filters/pagination
   * GET /drivers/all?isOnline=true&page=1&limit=20
   */
  @Get('all')
  async getAllDrivers(
    @Query('isOnline') isOnline?: string,
    @Query('area') area?: string,
    @Query('page') page = '1',
    @Query('limit') limit = String(DriverService['DEFAULT_NEARBY_DRIVERS_LIMIT']),
  ) {
    const filter: any = {};
    if (isOnline !== undefined) filter.isOnline = isOnline === 'true';
    if (area) filter.area = area;

    const result = await this.driverService.getAllDrivers(filter, Number(page), Number(limit));
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  @Patch('location')
  async updateDriverLocation(
    @Request() req,
    @Body() locationDto: UpdateDriverLocationDto,
  ) {
    const updatedDriver = await this.driverService.updateDriverLocation(
      req.user.id,
      locationDto.latitude,
      locationDto.longitude,
      locationDto.isOnline,
    );
    return {
      message: 'Location updated successfully',
      driver: updatedDriver,
    };
  }

  /**
   * DRIVER: Subscribe to real-time ride notifications via Server-Sent Events (SSE)
   * GET /drivers/subscribe-to-bookings
   * 
   * This endpoint establishes a persistent connection that sends instant
   * notifications when a new ride request matches the driver's location.
   * The driver will receive notifications immediately instead of polling.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  @Get('subscribe-to-bookings')
  subscribeToBookings(@Request() req, @Res() res: Response) {
    const driverId = req.user.id;
    console.log(`🔔 [DRIVER CONTROLLER] Driver ${driverId} subscribed to SSE notifications`);
    this.notificationService.subscribeDriver(driverId, res);
    // Note: Do NOT call res.end() - the SSE stream continues until client disconnects
  }

  /**
   * DRIVER: Check if they are connected to notification stream
   * GET /drivers/notification-status
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleRequired(Role.DRIVER)
  @Get('notification-status')
  getNotificationStatus(@Request() req) {
    const driverId = req.user.id;
    const isConnected = this.notificationService.isDriverConnected(driverId);
    return {
      driverId,
      isConnected,
      message: isConnected ? 'Connected to ride notifications' : 'Not connected to notifications',
    };
  }
}

