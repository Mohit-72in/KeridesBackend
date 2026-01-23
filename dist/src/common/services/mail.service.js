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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
let MailService = class MailService {
    transporter = null;
    logger = new common_1.Logger('MailService');
    constructor() {
        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_APP_PASSWORD;
        try {
            const nodemailer = require('nodemailer');
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass },
            });
        }
        catch (err) {
            this.logger.warn('nodemailer not available — email sending disabled in this environment');
            this.transporter = null;
        }
    }
    async sendDriverAssignedEmail(driverEmail, driverName, booking) {
        if (!driverEmail || !this.transporter)
            return false;
        const subject = `New booking assigned: ${booking.bookingId || booking.rideId || ''}`;
        const text = `Hello ${driverName || 'Driver'},\n\nA user has selected you for a ride.\n\nPickup: ${booking.origin?.address || booking.pickupLocation}\nDropoff: ${booking.destination?.address || booking.dropoffLocation}\nPickup Time: ${booking.bookingTime || booking.timestamp || ''}\nEstimated Fare: ${booking.price?.total ?? booking.estimatedFare}\n\nPlease open your driver app to confirm or reject the ride.\n\nThank you.`;
        try {
            await this.transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: driverEmail,
                subject,
                text,
            });
            this.logger.log(`Email sent to driver ${driverEmail} for booking ${booking.bookingId || booking.rideId}`);
            return true;
        }
        catch (err) {
            this.logger.error('Failed to send driver assigned email', err);
            return false;
        }
    }
    async sendDriverResponseEmailToUser(userEmail, userName, driverName, response, booking) {
        if (!userEmail)
            return false;
        const subject = response === 'ACCEPTED' ? `Driver confirmed your ride ${booking.bookingId || booking.rideId}` : `Driver rejected your ride ${booking.bookingId || booking.rideId}`;
        const text = response === 'ACCEPTED'
            ? `Hello ${userName || 'Customer'},\n\nGood news! ${driverName} has accepted your ride. Please wait for the driver to arrive.\n\nPickup: ${booking.origin?.address || booking.pickupLocation}\nEstimated Fare: ${booking.price?.total ?? booking.estimatedFare}\n\nThank you for using our service.`
            : `Hello ${userName || 'Customer'},\n\nWe are sorry to inform you that ${driverName} has rejected the ride you requested. You may choose another driver or try again.\n\nPickup: ${booking.origin?.address || booking.pickupLocation}\n\nWe apologize for the inconvenience.`;
        try {
            await this.transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: userEmail,
                subject,
                text,
            });
            this.logger.log(`Email sent to user ${userEmail} regarding driver ${response}`);
            return true;
        }
        catch (err) {
            this.logger.error('Failed to send user notification email', err);
            return false;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map