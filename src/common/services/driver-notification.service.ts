import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

interface DriverSubscription {
    driverId: string;
    response: Response;
    connectedAt: Date;
}

@Injectable()
export class DriverNotificationService {
    private logger = new Logger('DriverNotificationService');
    private activeSubscriptions: Map<string, DriverSubscription> = new Map();

    /**
     * Subscribe a driver to receive real-time ride notifications via SSE
     */
    subscribeDriver(driverId: string, response: Response): void {
        // Set SSE headers
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('X-Accel-Buffering', 'no');
        response.setHeader('Access-Control-Allow-Origin', '*');

        // Send initial connection message
        response.write('data: {"event":"connected","message":"Connected to ride notifications"}\n\n');

        const subscription: DriverSubscription = {
            driverId,
            response,
            connectedAt: new Date(),
        };

        this.activeSubscriptions.set(driverId, subscription);
        this.logger.log(
            `✅ Driver ${driverId} connected to SSE. Total subscriptions: ${this.activeSubscriptions.size}`,
        );

        // Handle client disconnect
        response.on('close', () => {
            this.activeSubscriptions.delete(driverId);
            this.logger.log(
                `❌ Driver ${driverId} disconnected from SSE. Total subscriptions: ${this.activeSubscriptions.size}`,
            );
            response.end();
        });

        response.on('error', (error) => {
            this.logger.error(`SSE Error for driver ${driverId}:`, error);
            this.activeSubscriptions.delete(driverId);
            response.end();
        });
    }

    /**
     * Send a ride notification to a specific driver
     */
    notifyDriver(driverId: string, bookingData: any): boolean {
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
        } catch (error) {
            this.logger.error(`Failed to send notification to driver ${driverId}:`, error);
            this.activeSubscriptions.delete(driverId);
            return false;
        }
    }

    /**
     * Notify multiple drivers at once
     */
    notifyMultipleDrivers(driverIds: string[], bookingData: any): { sent: number; failed: number } {
        let sent = 0;
        let failed = 0;

        for (const driverId of driverIds) {
            const success = this.notifyDriver(driverId, bookingData);
            if (success) {
                sent++;
            } else {
                failed++;
            }
        }

        this.logger.log(`📊 Batch notification: ${sent} sent, ${failed} failed`);
        return { sent, failed };
    }

    /**
     * Check if a driver is connected to SSE
     */
    isDriverConnected(driverId: string): boolean {
        return this.activeSubscriptions.has(driverId);
    }

    /**
     * Get all connected drivers
     */
    getConnectedDrivers(): string[] {
        return Array.from(this.activeSubscriptions.keys());
    }

    /**
     * Get connection statistics
     */
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

    /**
     * Disconnect a specific driver (admin function)
     */
    disconnectDriver(driverId: string): boolean {
        const subscription = this.activeSubscriptions.get(driverId);
        if (subscription) {
            try {
                subscription.response.end();
                this.activeSubscriptions.delete(driverId);
                this.logger.log(`🔌 Driver ${driverId} disconnected (manual)`);
                return true;
            } catch (error) {
                this.logger.error(`Failed to disconnect driver ${driverId}:`, error);
                return false;
            }
        }
        return false;
    }

    /**
     * Disconnect all drivers (useful for graceful shutdown)
     */
    disconnectAll(): void {
        for (const [driverId, subscription] of this.activeSubscriptions.entries()) {
            try {
                subscription.response.end();
                this.activeSubscriptions.delete(driverId);
            } catch (error) {
                this.logger.error(`Failed to disconnect driver ${driverId}:`, error);
            }
        }
        this.logger.log(`🔌 All drivers disconnected`);
    }
}
