import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    Logger,
} from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('ValidationExceptionFilter');

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        const message = Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message
            : [exceptionResponse.message];

        this.logger.warn(`Validation failed: ${JSON.stringify(message)}`);

        response.status(status).json({
            statusCode: status,
            message: 'Validation failed',
            errors: message,
            timestamp: new Date().toISOString(),
        });
    }
}
