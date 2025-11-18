


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppConfigService } from './infrastructure/config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SupportedLang, t } from './locales';
import { ValidationError } from 'class-validator';
import { translateValidationMessage } from './common/helpers/validation.helper';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  app.use(cookieParser());

 
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        if (!errors || errors.length === 0) {
          // safety check
          return new BadRequestException({
            success: false,
            message: t('validationFailed', 'al'),
          });
        }

        const formatted: Record<string, string[]> = {};
        const lang: SupportedLang = 'al'; 

        for (const err of errors) {
          if (err.constraints) {
            formatted[err.property] = Object.values(err.constraints).map(code =>
              translateValidationMessage(code, lang)
            );
          }
        }

        return new BadRequestException({
          success: false,
          message: t('validationFailed', lang),
          errors: formatted,
        });
      },
    }),
  );

  
  app.useGlobalFilters(new AllExceptionsFilter());

  
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Real Estate App API')
    .setDescription('API documentation for the Real Estate backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(configService.port);
  console.log(`🚀 Server running on port ${configService.port}`);
  console.log(`📘 Swagger available at http://localhost:${configService.port}/api/docs`);
}

bootstrap();
