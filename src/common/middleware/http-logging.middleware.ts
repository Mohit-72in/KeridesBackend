import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use = (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const { method, originalUrl, ip } = req;

        res.on('finish', () => {
            const responseTime = Date.now() - startTime;
            const { statusCode } = res;

            try {
                if (statusCode >= 400) {
                    this.logger.error(
                        `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - IP: ${ip}`,
                    );
                } else {
                    this.logger.log(
                        `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`,
                    );
                }
            } catch (error) {
                console.error('Logging middleware error:', error);
            }
        });

        next();
    };
}
