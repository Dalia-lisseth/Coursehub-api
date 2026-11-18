import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  let app: INestApplication;
  if (httpsEnabled) {
    const certificatePath = process.env.HTTPS_CERT_PATH;
    const keyPath = process.env.HTTPS_KEY_PATH;
    if (!certificatePath || !keyPath) {
      throw new Error(
        'HTTPS_CERT_PATH and HTTPS_KEY_PATH are required when HTTPS_ENABLED=true',
      );
    }
    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        cert: readFileSync(certificatePath),
        key: readFileSync(keyPath),
      },
    });
  } else {
    app = await NestFactory.create(AppModule);
  }
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGINS').split(','),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(config.getOrThrow<number>('PORT'));
}

bootstrap();