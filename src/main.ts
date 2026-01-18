


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
import { requestContext } from './common/context/request-context';

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
      const store = requestContext.getStore();
      const lang: SupportedLang = store?.language ?? 'al';

      const formatted: Record<string, string[]> = {};

      for (const err of errors) {
        if (err.constraints) {
          formatted[err.property] = Object.values(err.constraints).map(
            code => translateValidationMessage(code, lang),
          );
        }
      }
  app.use((req, res, next) => {
    if (req.url.includes('profile-image') && req.method === 'PATCH') {
      console.log('═══════════════════════════════════════');
      console.log('🔍 MIDDLEWARE INTERCEPTED REQUEST');
      console.log('URL:', req.url);
      console.log('Method:', req.method);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body:', req.body);
      console.log('File:', req.file);
      console.log('Files:', req.files);
      console.log('═══════════════════════════════════════');
    }
    next();
  });
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
    origin: configService.clientBaseUrl,
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
