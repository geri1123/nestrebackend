import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function throwValidationErrors(errors: ValidationError[]) {
  const formatted: Record<string, string[]> = {};
  errors.forEach(err => {
    formatted[err.property] = Object.values(err.constraints ?? {});
  });
  throw new BadRequestException(formatted);
}