"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const booking_schema_1 = require("../schemas/booking.schema");
const driver_schema_1 = require("../schemas/driver.schema");
const vehicle_schema_1 = require("../schemas/vehicle.schema");
const user_schema_1 = require("../schemas/user.schema");
const booking_service_1 = require("./booking.service");
const booking_controller_1 = require("./booking.controller");
const ride_service_1 = require("./ride.service");
const ride_controller_1 = require("./ride.controller");
const driver_module_1 = require("../driver/driver.module");
const driver_notification_service_1 = require("../common/services/driver-notification.service");
const mail_service_1 = require("../common/services/mail.service");
let BookingModule = class BookingModule {
};
exports.BookingModule = BookingModule;
exports.BookingModule = BookingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: booking_schema_1.Booking.name, schema: booking_schema_1.BookingSchema },
                { name: driver_schema_1.Driver.name, schema: driver_schema_1.DriverSchema },
                { name: vehicle_schema_1.Vehicle.name, schema: vehicle_schema_1.VehicleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            driver_module_1.DriverModule,
        ],
        providers: [booking_service_1.BookingService, ride_service_1.RideService, driver_notification_service_1.DriverNotificationService, mail_service_1.MailService],
        controllers: [booking_controller_1.BookingController, ride_controller_1.RideController],
        exports: [booking_service_1.BookingService, ride_service_1.RideService],
    })
], BookingModule);
//# sourceMappingURL=booking.module.js.map