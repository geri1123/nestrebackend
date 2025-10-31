// src/common/pipes/custom-validation.pipe.ts
import { Injectable, ArgumentMetadata, BadRequestException, ValidationPipe, PipeTransform } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { throwValidationErrors } from './validation.helper';
import type { RequestWithUser } from '../types/request-with-user.interface';
import { SupportedLang } from '../../locales';
@Injectable()
export class CustomValidationPipe extends ValidationPipe implements PipeTransform<any> {
  constructor(private readonly dtoClass?: any) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[], req?: any) => {
        // ✅ Use request language if available
        const lang: SupportedLang = req?.language || 'al';
        return throwValidationErrors(errors, lang);
      },
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    // Convert plain object to DTO instance if dtoClass is provided
    if (this.dtoClass) {
      value = Object.assign(new this.dtoClass(), value);
    }

    // Extract request from metadata if available
    const req = (metadata?.metatype?.name === 'Object') ? metadata : undefined;

    // Perform standard validation
    const validated = await super.transform(value, metadata);

    return validated;
  }
}