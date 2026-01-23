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
var DriverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const driver_schema_1 = require("../schemas/driver.schema");
const date_transformer_1 = require("../common/transformers/date.transformer");
let DriverService = class DriverService {
    static { DriverService_1 = this; }
    driverModel;
    dateTransformer;
    constructor(driverModel, dateTransformer) {
        this.driverModel = driverModel;
        this.dateTransformer = dateTransformer;
    }
    async create(dto) {
        const transformedDto = this.dateTransformer.transformDates(dto);
        return this.driverModel.create(transformedDto);
    }
    async findByEmail(email) {
        return this.driverModel.findOne({ email });
    }
    async findById(id) {
        return this.driverModel.findById(id).select('-password');
    }
    async updateDriver(id, updateDto) {
        const transformedDto = this.dateTransformer.transformDates(updateDto);
        return this.driverModel
            .findByIdAndUpdate(id, { $set: transformedDto }, { new: true })
            .select('-password');
    }
    async resetCollection() {
        await this.driverModel.collection.drop();
        return { message: 'Drivers collection reset successfully' };
    }
    async addDocument(driverId, documentData) {
        return this.driverModel
            .findByIdAndUpdate(driverId, {
            $push: {
                documents: {
                    url: documentData.url,
                    key: documentData.key,
                    fileName: documentData.fileName,
                    fileType: documentData.fileType,
                    uploadedAt: new Date(),
                },
            },
        }, { new: true })
            .select('-password');
    }
    async updateDriverLocation(driverId, latitude, longitude, isOnline) {
        const updateData = {
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
    async updateDriverGeoLocation(driverId, latitude, longitude, isOnline = true) {
        console.log(`[Driver Service] Updating location for driver ${driverId}: lat=${latitude}, lng=${longitude}`);
        const result = await this.driverModel
            .findByIdAndUpdate(driverId, {
            latitude,
            longitude,
            locationFieldType: 'Point',
            coordinates: [longitude, latitude],
            isOnline,
            lastLocationUpdate: new Date(),
        }, { new: true })
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
    async goOffline(driverId) {
        return this.driverModel
            .findByIdAndUpdate(driverId, {
            isOnline: false,
            $unset: {
                location: '',
                coordinates: '',
                locationFieldType: '',
            },
        }, { new: true })
            .select('-password');
    }
    static DEFAULT_NEARBY_DRIVERS_RADIUS_KM = parseFloat(process.env.NEARBY_DRIVERS_RADIUS_KM || '5');
    static DEFAULT_NEARBY_DRIVERS_LIMIT = parseInt(process.env.NEARBY_DRIVERS_LIMIT || '10', 10);
    async getNearbyDrivers(latitude, longitude, radiusKm = DriverService_1.DEFAULT_NEARBY_DRIVERS_RADIUS_KM) {
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
            const distance = this.calculateDistance(latitude, longitude, driver.latitude, driver.longitude);
            return distance <= radiusKm;
        })
            .sort((a, b) => {
            const distA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
            const distB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
            return distA - distB;
        })
            .slice(0, DriverService_1.DEFAULT_NEARBY_DRIVERS_LIMIT);
        return nearbyDrivers;
    }
    async getAllDrivers(filter = {}, page = 1, limit = DriverService_1.DEFAULT_NEARBY_DRIVERS_LIMIT) {
        const q = {};
        if (typeof filter.isOnline === 'boolean')
            q.isOnline = filter.isOnline;
        if (filter.area)
            q.operatingArea = filter.area;
        const skip = Math.max(0, (page - 1)) * limit;
        const [items, total] = await Promise.all([
            this.driverModel.find(q).select('-password -documents').skip(skip).limit(limit).lean(),
            this.driverModel.countDocuments(q),
        ]);
        return { items, total, page, limit };
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(degrees) {
        return (degrees * Math.PI) / 180;
    }
};
exports.DriverService = DriverService;
exports.DriverService = DriverService = DriverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(driver_schema_1.Driver.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        date_transformer_1.DateTransformer])
], DriverService);
//# sourceMappingURL=driver.service.js.map