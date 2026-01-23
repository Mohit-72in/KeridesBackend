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
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vehicle_schema_1 = require("../../schemas/vehicle.schema");
let VehicleService = class VehicleService {
    vehicleModel;
    constructor(vehicleModel) {
        this.vehicleModel = vehicleModel;
    }
    async createVehicle(driverId, createVehicleDto) {
        const vehicle = new this.vehicleModel({
            ...createVehicleDto,
            driverId,
        });
        return vehicle.save();
    }
    async getDriverVehicles(driverId) {
        return this.vehicleModel.find({ driverId }).sort({ createdAt: -1 });
    }
    async getAllAvailableVehicles() {
        return this.vehicleModel
            .find()
            .populate('driverId', 'fullName email phoneNumber latitude longitude isOnline drivingExperience')
            .exec();
    }
    async getAllVehicles() {
        return this.vehicleModel
            .find()
            .populate('driverId', 'fullName email phoneNumber')
            .exec();
    }
    async getVehicleById(vehicleId) {
        return this.vehicleModel
            .findById(vehicleId)
            .populate('driverId', 'fullName email phoneNumber')
            .exec();
    }
    async updateVehicle(vehicleId, updateVehicleDto) {
        return this.vehicleModel.findByIdAndUpdate(vehicleId, { $set: updateVehicleDto }, { new: true });
    }
    async deleteVehicle(vehicleId) {
        return this.vehicleModel.findByIdAndDelete(vehicleId);
    }
    async addVehicleDocument(vehicleId, documentType, documentUrl) {
        return this.vehicleModel.findByIdAndUpdate(vehicleId, { $set: { [`documents.${documentType}`]: documentUrl } }, { new: true });
    }
    async addVehicleImages(vehicleId, imageUrls) {
        return this.vehicleModel.findByIdAndUpdate(vehicleId, { $push: { vehicleImages: { $each: imageUrls } } }, { new: true });
    }
    async removeVehicleImage(vehicleId, imageUrl) {
        return this.vehicleModel.findByIdAndUpdate(vehicleId, { $pull: { vehicleImages: imageUrl } }, { new: true });
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vehicle_schema_1.Vehicle.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map