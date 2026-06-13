


// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe, BadRequestException } from '@nestjs/common';
// import cookieParser from 'cookie-parser';
// import { AppConfigService } from './infrastructure/config/config.service';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { SupportedLang, t } from './locales';
// import { ValidationError } from 'class-validator';
// import { translateValidationMessage } from './common/helpers/validation.helper';
// import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
// import { requestContext } from './common/context/request-context';
// import { join } from 'path/win32';
// import { NestExpressApplication } from '@nestjs/platform-express';

// async function bootstrap() {
//   // const app = await NestFactory.create(AppModule);
// // const app = await NestFactory.create(AppModule, {
// //   rawBody: true,  
// // });  
//  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
//     rawBody: true,
//   });
//   const configService = app.get(AppConfigService);

//   app.use(cookieParser());

//  app.useGlobalPipes(
//   new ValidationPipe({
//     transform: true,
//     whitelist: true,
//       forbidNonWhitelisted: true,
//     transformOptions: {
//       enableImplicitConversion: true,
//     },
//     exceptionFactory: (errors: ValidationError[]) => {
//       const store = requestContext.getStore();
//       const lang: SupportedLang = store?.language ?? 'al';

//       const formatted: Record<string, string[]> = {};

//       for (const err of errors) {
//         if (err.constraints) {
//           formatted[err.property] = Object.values(err.constraints).map(
//             code => translateValidationMessage(code, lang),
//           );
//         }
//       }

//       return new BadRequestException({
//         success: false,
//         message: t('validationFailed', lang),
//         errors: formatted,
//       });
//     },
//   }),
// );
  
//   app.useStaticAssets(join(process.cwd(), 'public'));
//   app.useGlobalFilters(new AllExceptionsFilter());

// app.enableCors({
//   origin: (origin, callback) => {
//     const allowedOrigins = configService.corsOrigins; 
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error(`CORS policy: ${origin} not allowed`));
//     }
//   },
//   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
//   credentials: true,
// });

  
//   const swaggerConfig = new DocumentBuilder()
//     .setTitle('Real Estate App API')
//     .setDescription('API documentation for the Real Estate backend')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();

//   const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
//   SwaggerModule.setup('api/docs', app, swaggerDocument);

// await app.listen(configService.port);
// // await app.listen(configService.port, '0.0.0.0');
//   console.log(` Server running on port ${configService.port}`);
//   console.log(` Swagger available at http://localhost:${configService.port}/api/docs`);
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
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
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

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

        return new BadRequestException({
          success: false,
          message: t('validationFailed', lang),
          errors: formatted,
        });
      },
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = configService.corsOrigins;
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
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
  console.log(`Server running on port ${configService.port}`);
  console.log(`Swagger available at http://localhost:${configService.port}/api/docs`);
}

bootstrap();