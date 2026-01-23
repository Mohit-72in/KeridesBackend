"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverNotificationService = void 0;
const common_1 = require("@nestjs/common");
let DriverNotificationService = class DriverNotificationService {
    logger = new common_1.Logger('DriverNotificationService');
    activeSubscriptions = new Map();
    subscribeDriver(driverId, response) {
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('X-Accel-Buffering', 'no');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.write('data: {"event":"connected","message":"Connected to ride notifications"}\n\n');
        const subscription = {
            driverId,
            response,
            connectedAt: new Date(),
        };
        this.activeSubscriptions.set(driverId, subscription);
        this.logger.log(`✅ Driver ${driverId} connected to SSE. Total subscriptions: ${this.activeSubscriptions.size}`);
        response.on('close', () => {
            this.activeSubscriptions.delete(driverId);
            this.logger.log(`❌ Driver ${driverId} disconnected from SSE. Total subscriptions: ${this.activeSubscriptions.size}`);
            response.end();
        });
        response.on('error', (error) => {
            this.logger.error(`SSE Error for driver ${driverId}:`, error);
            this.activeSubscriptions.delete(driverId);
            response.end();
        });
    }
    notifyDriver(driverId, bookingData) {
        const subscription = this.activeSubscriptions.get(driverId);
        if (!subscription) {
            this.logger.warn(`Driver ${driverId} is not connected to SSE`);
            return false;
        }
        try {
            const eventData = {
                event: 'new_ride_request',
                booking: bookingData,
                timestamp: new Date().toISOString(),
            };
            subscription.response.write(`data: ${JSON.stringify(eventData)}\n\n`);
            this.logger.log(`📤 Notification sent to driver ${driverId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send notification to driver ${driverId}:`, error);
            this.activeSubscriptions.delete(driverId);
            return false;
        }
    }
    notifyMultipleDrivers(driverIds, bookingData) {
        let sent = 0;
        let failed = 0;
        for (const driverId of driverIds) {
            const success = this.notifyDriver(driverId, bookingData);
            if (success) {
                sent++;
            }
            else {
                failed++;
            }
        }
        this.logger.log(`📊 Batch notification: ${sent} sent, ${failed} failed`);
        return { sent, failed };
    }
    isDriverConnected(driverId) {
        return this.activeSubscriptions.has(driverId);
    }
    getConnectedDrivers() {
        return Array.from(this.activeSubscriptions.keys());
    }
    getConnectionStats() {
        return {
            totalConnections: this.activeSubscriptions.size,
            connectedDrivers: this.getConnectedDrivers(),
            connectionDetails: Array.from(this.activeSubscriptions.values()).map((sub) => ({
                driverId: sub.driverId,
                connectedSince: sub.connectedAt,
                connectionDuration: Date.now() - sub.connectedAt.getTime(),
            })),
        };
    }
    disconnectDriver(driverId) {
        const subscription = this.activeSubscriptions.get(driverId);
        if (subscription) {
            try {
                subscription.response.end();
                this.activeSubscriptions.delete(driverId);
                this.logger.log(`🔌 Driver ${driverId} disconnected (manual)`);
                return true;
            }
            catch (error) {
                this.logger.error(`Failed to disconnect driver ${driverId}:`, error);
                return false;
            }
        }
        return false;
    }
    disconnectAll() {
        for (const [driverId, subscription] of this.activeSubscriptions.entries()) {
            try {
                subscription.response.end();
                this.activeSubscriptions.delete(driverId);
            }
            catch (error) {
                this.logger.error(`Failed to disconnect driver ${driverId}:`, error);
            }
        }
        this.logger.log(`🔌 All drivers disconnected`);
    }
};
exports.DriverNotificationService = DriverNotificationService;
exports.DriverNotificationService = DriverNotificationService = __decorate([
    (0, common_1.Injectable)()
], DriverNotificationService);
//# sourceMappingURL=driver-notification.service.js.map