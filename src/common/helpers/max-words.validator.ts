import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function MaxWords(max: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxWords',
      target: object.constructor,
      propertyName,
      constraints: [max],
      options: validationOptions,
      validator: {
        validate(value: unknown, args?: ValidationArguments) {
          if (value === null || value === undefined || value === '') return true;
          if (typeof value !== 'string') return false;
          const limit = (args?.constraints?.[0] as number) ?? max;
          const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
          return wordCount <= limit;
        },
        defaultMessage(args?: ValidationArguments) {
          const limit = (args?.constraints?.[0] as number) ?? max;
          const property = args?.property ?? 'value';
          return `${property} must not exceed ${limit} words`;
        },
      },
    });
  };
}