import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppConfigService } from './config/config.service';

// ✅ Swagger imports
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SupportedLang, t } from './locales';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  app.use(cookieParser());

  // 💥 Validation formatting
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
 transformOptions: {
        enableImplicitConversion: true,
      },
    exceptionFactory: (errors) => {
      const formatted: Record<string, string[]> = {};

      for (const err of errors) {
        if (err.constraints) {
          formatted[err.property] = Object.values(err.constraints);
        }
      }

      // you can later detect language from request middleware
      const lang: SupportedLang = 'al';

      return new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors: formatted,
      });
    },
  }),
);

  //  Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  //  Swagger Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('My App API')
    .setDescription('API documentation for my NestJS backend')
    .setVersion('1.0')
    .addBearerAuth() // optional for JWT token auth
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  // Start server
  await app.listen(configService.port);
  console.log(`🚀 Server running on port ${configService.port}`);
  console.log(`📘 Swagger available at http://localhost:${configService.port}/api/docs`);
}

bootstrap();
