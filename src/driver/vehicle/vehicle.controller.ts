import {
    Body,
    Controller,
    Patch,
    Post,
    Get,
    Delete,
    Param,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleRequired } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enums/role.enum';
import { S3Service } from '../../common/services/s3.service';

@Controller('drivers/vehicles')
export class VehicleController {
    constructor(
        private readonly vehicleService: VehicleService,
        private readonly s3Service: S3Service,
    ) { }

    // Public endpoint for frontend - Get all available vehicles with driver details
    @Get('available')
    getAllAvailableVehicles() {
        return this.vehicleService.getAllAvailableVehicles();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Post()
    createVehicle(
        @Request() req,
        @Body() createVehicleDto: CreateVehicleDto,
    ) {
        return this.vehicleService.createVehicle(req.user.id, createVehicleDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Get()
    getMyVehicles(@Request() req) {
        return this.vehicleService.getDriverVehicles(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Get(':vehicleId')
    getVehicleById(@Param('vehicleId') vehicleId: string) {
        return this.vehicleService.getVehicleById(vehicleId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Patch(':vehicleId')
    updateVehicle(
        @Param('vehicleId') vehicleId: string,
        @Body() updateVehicleDto: UpdateVehicleDto,
    ) {
        return this.vehicleService.updateVehicle(vehicleId, updateVehicleDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Delete(':vehicleId')
    deleteVehicle(@Param('vehicleId') vehicleId: string) {
        return this.vehicleService.deleteVehicle(vehicleId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Post(':vehicleId/documents/:documentType')
    uploadDocument(
        @Param('vehicleId') vehicleId: string,
        @Param('documentType') documentType: string,
        @Body('documentUrl') documentUrl: string,
    ) {
        return this.vehicleService.addVehicleDocument(
            vehicleId,
            documentType,
            documentUrl,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Post(':vehicleId/images')
    addVehicleImages(
        @Param('vehicleId') vehicleId: string,
        @Body('imageUrls') imageUrls: string[],
    ) {
        return this.vehicleService.addVehicleImages(vehicleId, imageUrls);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Delete(':vehicleId/images/:imageUrl')
    removeVehicleImage(
        @Param('vehicleId') vehicleId: string,
        @Param('imageUrl') imageUrl: string,
    ) {
        return this.vehicleService.removeVehicleImage(vehicleId, imageUrl);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Post(':vehicleId/upload-document')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVehicleDocument(
        @Param('vehicleId') vehicleId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        try {
            const { url, key } = await this.s3Service.uploadFile(
                file,
                `vehicles/${vehicleId}/documents`,
            );
            return {
                message: 'Document uploaded successfully',
                url,
                key,
                size: file.size,
                type: file.mimetype,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    @Post(':vehicleId/upload-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVehicleImage(
        @Param('vehicleId') vehicleId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        try {
            const { url, key } = await this.s3Service.uploadFile(
                file,
                `vehicles/${vehicleId}/images`,
            );
            return {
                message: 'Image uploaded successfully',
                url,
                key,
                size: file.size,
                type: file.mimetype,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}