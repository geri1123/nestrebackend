import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { SupportedLang } from '../../locales';
import { t } from '../../locales';
export function throwValidationErrors(errors: ValidationError[], lang: SupportedLang = 'al') {
  const formatted: Record<string, string[]> = {};

  errors.forEach(err => {
    if (err.constraints) {
      formatted[err.property] = Object.values(err.constraints);
    }
  });

  throw new BadRequestException({
    success: false,
    message: t('validationFailed', lang),
    errors: formatted,
  });
}