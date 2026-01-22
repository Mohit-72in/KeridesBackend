import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
                message = (exceptionResponse as any).message || message;
                errors = (exceptionResponse as any).errors || null;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Error: ${exception.message}`, exception.stack);
        }

        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
        );

        response.status(status).json({
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
