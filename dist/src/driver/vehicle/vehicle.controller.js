"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const vehicle_service_1 = require("./vehicle.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const role_decorator_1 = require("../../common/decorators/role.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const s3_service_1 = require("../../common/services/s3.service");
let VehicleController = class VehicleController {
    vehicleService;
    s3Service;
    constructor(vehicleService, s3Service) {
        this.vehicleService = vehicleService;
        this.s3Service = s3Service;
    }
    getAllAvailableVehicles() {
        return this.vehicleService.getAllAvailableVehicles();
    }
    createVehicle(req, createVehicleDto) {
        return this.vehicleService.createVehicle(req.user.id, createVehicleDto);
    }
    getMyVehicles(req) {
        return this.vehicleService.getDriverVehicles(req.user.id);
    }
    getVehicleById(vehicleId) {
        return this.vehicleService.getVehicleById(vehicleId);
    }
    updateVehicle(vehicleId, updateVehicleDto) {
        return this.vehicleService.updateVehicle(vehicleId, updateVehicleDto);
    }
    deleteVehicle(vehicleId) {
        return this.vehicleService.deleteVehicle(vehicleId);
    }
    uploadDocument(vehicleId, documentType, documentUrl) {
        return this.vehicleService.addVehicleDocument(vehicleId, documentType, documentUrl);
    }
    addVehicleImages(vehicleId, imageUrls) {
        return this.vehicleService.addVehicleImages(vehicleId, imageUrls);
    }
    removeVehicleImage(vehicleId, imageUrl) {
        return this.vehicleService.removeVehicleImage(vehicleId, imageUrl);
    }
    async uploadVehicleDocument(vehicleId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        try {
            const { url, key } = await this.s3Service.uploadFile(file, `vehicles/${vehicleId}/documents`);
            return {
                message: 'Document uploaded successfully',
                url,
                key,
                size: file.size,
                type: file.mimetype,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async uploadVehicleImage(vehicleId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        try {
            const { url, key } = await this.s3Service.uploadFile(file, `vehicles/${vehicleId}/images`);
            return {
                message: 'Image uploaded successfully',
                url,
                key,
                size: file.size,
                type: file.mimetype,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.VehicleController = VehicleController;
__decorate([
    (0, common_1.Get)('available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "getAllAvailableVehicles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "getMyVehicles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Get)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "getVehicleById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Patch)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Delete)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "deleteVehicle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Post)(':vehicleId/documents/:documentType'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Param)('documentType')),
    __param(2, (0, common_1.Body)('documentUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Post)(':vehicleId/images'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Body)('imageUrls')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "addVehicleImages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Delete)(':vehicleId/images/:imageUrl'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Param)('imageUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "removeVehicleImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Post)(':vehicleId/upload-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "uploadVehicleDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Post)(':vehicleId/upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "uploadVehicleImage", null);
exports.VehicleController = VehicleController = __decorate([
    (0, common_1.Controller)('drivers/vehicles'),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService,
        s3_service_1.S3Service])
], VehicleController);
//# sourceMappingURL=vehicle.controller.js.map