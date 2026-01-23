export declare class MailService {
    private transporter;
    private logger;
    constructor();
    sendDriverAssignedEmail(driverEmail: string, driverName: string, booking: any): Promise<boolean>;
    sendDriverResponseEmailToUser(userEmail: string, userName: string, driverName: string, response: 'ACCEPTED' | 'REJECTED', booking: any): Promise<boolean>;
}
