// src/common/pipes/custom-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata, ValidationPipe } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(private readonly dtoClass?: any) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formatted: Record<string, string[]> = {};
        errors.forEach(err => {
          formatted[err.property] = Object.values(err.constraints ?? {});
        });
        return new BadRequestException(formatted);
      },
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    if (this.dtoClass) {
      value = Object.assign(new this.dtoClass(), value);
    }
    return super.transform(value, metadata);
  }
}