import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { LoggerErrorInterceptor, Logger as PinoLogger } from 'nestjs-pino';
import * as path from 'path';

import { AppModule } from './app/app.module';

function setupSwagger<T>(app: INestApplication<T>, prefix: string) {
  const config = new DocumentBuilder()
    .setTitle('Read-n-feed API')
    .setDescription('The API for GTS Digital Library')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${prefix}/swagger`, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useLogger(await app.get(PinoLogger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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

  app.use(cookieParser());

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://dmitriygo.github.io'
        : ['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  setupSwagger(app, globalPrefix);

  // Configure file upload limits
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Configure static file serving for uploads
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  app.use(
    '/files',
    express.static(path.join(process.cwd(), uploadDir), {
      setHeaders: (res, filePath) => {
        // Proper content type detection based on file extension
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.pdf': 'application/pdf',
          '.epub': 'application/epub+zip',
          '.fb2': 'application/xml',
          '.mobi': 'application/x-mobipocket-ebook',
          '.azw3': 'application/vnd.amazon.ebook',
          // Add image mime types
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };

        if (mimeTypes[ext]) {
          res.set('Content-Type', mimeTypes[ext]);
        } else {
          res.set('Content-Type', 'application/octet-stream');
        }
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `🚀 Swagger is running on: http://localhost:${port}/${globalPrefix}/swagger`,
  );
}

bootstrap();
