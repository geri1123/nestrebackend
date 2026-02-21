import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from 'class-validator';
import { translateValidationMessage } from '../helpers/validation.helper';
import { requestContext } from '../context/request-context';
import { SupportedLang, t } from '../../locales';

@Injectable()
export class MultipartValidationPipe implements PipeTransform {
  constructor(private readonly dto: new () => any) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!this.dto) return value;

    const instance = plainToInstance(this.dto, value, {
      enableImplicitConversion: true,
    });

    const errors: ValidationError[] = await validate(instance);

    if (errors.length > 0) {
      const store = requestContext.getStore();
      const lang: SupportedLang = store?.language ?? 'al';

      const formatted: Record<string, string[]> = {};

      for (const err of errors) {
        if (err.constraints) {
          formatted[err.property] = Object.values(err.constraints).map(code =>
            translateValidationMessage(code, lang),
          );
        }
      }

      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors: formatted,
      });
    }

    return instance;
  }
}