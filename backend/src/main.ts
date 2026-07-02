import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet());

  const allowedOrigins = configService
    .get<string>('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({ origin: allowedOrigins, methods: ['GET'], credentials: false });

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}/${apiPrefix}`);
}
bootstrap();
