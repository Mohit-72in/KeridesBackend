import { Injectable, Logger } from '@nestjs/common';

// NOTE: `nodemailer` is optional at runtime for tests — require it lazily so unit tests don't fail when it's not installed.
@Injectable()
export class MailService {
  // keep `any` to avoid a hard runtime dependency in unit tests
  private transporter: any = null;
  private logger = new Logger('MailService');

  constructor() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    // lazy require to avoid module-not-found in test env where nodemailer may not be installed
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
      const nodemailer = require('nodemailer');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } catch (err) {
      this.logger.warn('nodemailer not available — email sending disabled in this environment');
      this.transporter = null;
    }
  }

  async sendDriverAssignedEmail(driverEmail: string, driverName: string, booking: any) {
    if (!driverEmail || !this.transporter) return false;

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
    } catch (err) {
      this.logger.error('Failed to send driver assigned email', err);
      return false;
    }
  }

  async sendDriverResponseEmailToUser(userEmail: string, userName: string, driverName: string, response: 'ACCEPTED' | 'REJECTED', booking: any) {
    if (!userEmail) return false;

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
    } catch (err) {
      this.logger.error('Failed to send user notification email', err);
      return false;
    }
  }
}
