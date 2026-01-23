import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { HttpLoggingMiddleware } from './common/middleware/http-logging.middleware';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Enable CORS
  // app.enableCors({
  //   origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  //   credentials: true,
  // });
    const allowedOrigins = [
    'http://localhost:5173',
    'http://www.kerides.com.s3-website.ap-south-1.amazonaws.com',
    'https://kerides.com',
    'https://d1wl66jz3nx0ag.cloudfront.net',
    'https://d17cga1n7nx3ua.cloudfront.net'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // allow server-to-server / curl / postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // HTTP logging middleware
  app.use(new HttpLoggingMiddleware().use);

  await app.listen(port);

  logger.log(`✓ Server running on http://localhost:${port}`);
  logger.log(`✓ Environment: ${nodeEnv}`);
  logger.log(`✓ All modules initialized successfully`);

  // DEV: fingerprint the JWT secret so we can quickly detect mismatches (non-sensitive)
  if (process.env.NODE_ENV !== 'production') {
    const fp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0,8);
    logger.debug(`JWT secret fingerprint at startup=${fp}`);
    if (!process.env.JWT_SECRET) logger.warn('JWT_SECRET is not set — using fallback may invalidate tokens');
  }

  // Graceful shutdown
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
