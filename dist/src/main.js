"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const http_logging_middleware_1 = require("./common/middleware/http-logging.middleware");
const logger = new common_1.Logger('Bootstrap');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = process.env.PORT || 3000;
    const nodeEnv = process.env.NODE_ENV || 'development';
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://www.kerides.com.s3-website.ap-south-1.amazonaws.com',
            'https://kerides.com',
            'https://d17cga1n7nx3ua.cloudfront.net',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.use(new http_logging_middleware_1.HttpLoggingMiddleware().use);
    await app.listen(port);
    logger.log(`✓ Server running on http://localhost:${port}`);
    logger.log(`✓ Environment: ${nodeEnv}`);
    logger.log(`✓ All modules initialized successfully`);
    if (process.env.NODE_ENV !== 'production') {
        const fp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
        logger.debug(`JWT secret fingerprint at startup=${fp}`);
        if (!process.env.JWT_SECRET)
            logger.warn('JWT_SECRET is not set — using fallback may invalidate tokens');
    }
    process.on('SIGTERM', async () => {
        logger.warn('SIGTERM received, shutting down gracefully...');
        await app.close();
        process.exit(0);
    });
}
bootstrap().catch((err) => {
    logger.error('Failed to start application', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map