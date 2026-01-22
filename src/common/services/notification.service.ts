/**
 * ⚠️ DEPRECATED: This service is no longer used
 *
 * The project uses REST API polling instead of WebSocket for notifications.
 * Drivers poll the /api/bookings/pending-for-driver endpoint every 5 seconds
 * to check for new ride requests.
 *
 * If you need this service in the future, uncomment the code below.
 */

// import { Injectable, Logger } from '@nestjs/common';
// import { Server } from 'socket.io';
//
// @Injectable()
// export class NotificationService {
//     private logger = new Logger('NotificationService');
//     private socketServer: Server;
//
//     setSocketServer(server: Server) {
//         this.socketServer = server;
//         this.logger.log('Socket.io server instance set');
//     }
//
//     notifyDrivers(driverSocketIds: string[], rideData: any) {
//         if (!this.socketServer) {
//             this.logger.warn('Socket server not initialized');
//             return;
//         }
//
//         let notificationCount = 0;
//         for (const driverSocketId of driverSocketIds) {
//             try {
//                 this.socketServer.to(driverSocketId).emit('new_ride_request', rideData);
//                 notificationCount++;
//             } catch (error) {
//                 this.logger.error(`Failed to notify driver ${driverSocketId}:`, error);
//             }
//         }
//
//         this.logger.log(`✅ Ride notification sent to ${notificationCount} drivers`);
//     }
//
//     notifyCustomer(customerSocketId: string, eventName: string, data: any) {
//         if (!this.socketServer) {
//             this.logger.warn('Socket server not initialized');
//             return;
//         }
//
//         try {
//             this.socketServer.to(customerSocketId).emit(eventName, data);
//             this.logger.log(`✅ Notification sent to customer: ${eventName}`);
//         } catch (error) {
//             this.logger.error(`Failed to notify customer:`, error);
//         }
//     }
// }
