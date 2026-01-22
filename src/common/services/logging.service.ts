import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService {
    private logger = new Logger('App');

    info(message: string, context?: string) {
        this.logger.log(message, context || 'INFO');
    }

    error(message: string, error?: any, context?: string) {
        this.logger.error(message, error?.stack || '', context || 'ERROR');
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, context || 'WARN');
    }

    debug(message: string, context?: string) {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(message, context || 'DEBUG');
        }
    }

    http(method: string, url: string, statusCode: number, responseTime: number) {
        this.logger.log(
            `${method} ${url} - ${statusCode} - ${responseTime}ms`,
            'HTTP',
        );
    }
}
