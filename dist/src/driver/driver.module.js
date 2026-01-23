"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const driver_service_1 = require("./driver.service");
const driver_controller_1 = require("./driver.controller");
const driver_schema_1 = require("../schemas/driver.schema");
const jwt_1 = require("@nestjs/jwt");
const vehicle_module_1 = require("./vehicle/vehicle.module");
const date_transformer_1 = require("../common/transformers/date.transformer");
const s3_service_1 = require("../common/services/s3.service");
const driver_notification_service_1 = require("../common/services/driver-notification.service");
const location_controller_1 = require("./location.controller");
let DriverModule = class DriverModule {
};
exports.DriverModule = DriverModule;
exports.DriverModule = DriverModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: driver_schema_1.Driver.name, schema: driver_schema_1.DriverSchema },
            ]),
            jwt_1.JwtModule,
            vehicle_module_1.VehicleModule,
        ],
        controllers: [driver_controller_1.DriverController, location_controller_1.LocationController],
        providers: [driver_service_1.DriverService, date_transformer_1.DateTransformer, s3_service_1.S3Service, driver_notification_service_1.DriverNotificationService],
        exports: [driver_service_1.DriverService, driver_notification_service_1.DriverNotificationService],
    })
], DriverModule);
//# sourceMappingURL=driver.module.js.map