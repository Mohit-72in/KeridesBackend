import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../../schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
    constructor(
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    ) { }

    async createVehicle(driverId: string, createVehicleDto: CreateVehicleDto) {
        const vehicle = new this.vehicleModel({
            ...createVehicleDto,
            driverId,
        });
        return vehicle.save();
    }

    async getDriverVehicles(driverId: string) {
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
            .populate('driverId', 'fullName email phoneNumber') // Populate driver data
            .exec();
    }
    async getVehicleById(vehicleId: string) {
        return this.vehicleModel
            .findById(vehicleId)
            .populate('driverId', 'fullName email phoneNumber')
            .exec();
    }

    async updateVehicle(
        vehicleId: string,
        updateVehicleDto: UpdateVehicleDto,
    ) {
        return this.vehicleModel.findByIdAndUpdate(
            vehicleId,
            { $set: updateVehicleDto },
            { new: true },
        );
    }

    async deleteVehicle(vehicleId: string) {
        return this.vehicleModel.findByIdAndDelete(vehicleId);
    }

    async addVehicleDocument(
        vehicleId: string,
        documentType: string,
        documentUrl: string,
    ) {
        return this.vehicleModel.findByIdAndUpdate(
            vehicleId,
            { $set: { [`documents.${documentType}`]: documentUrl } },
            { new: true },
        );
    }

    async addVehicleImages(vehicleId: string, imageUrls: string[]) {
        return this.vehicleModel.findByIdAndUpdate(
            vehicleId,
            { $push: { vehicleImages: { $each: imageUrls } } },
            { new: true },
        );
    }

    async removeVehicleImage(vehicleId: string, imageUrl: string) {
        return this.vehicleModel.findByIdAndUpdate(
            vehicleId,
            { $pull: { vehicleImages: imageUrl } },
            { new: true },
        );
    }
}
