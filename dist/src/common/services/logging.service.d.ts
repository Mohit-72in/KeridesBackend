export declare class LoggingService {
    private logger;
    info(message: string, context?: string): void;
    error(message: string, error?: any, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    http(method: string, url: string, statusCode: number, responseTime: number): void;
}
