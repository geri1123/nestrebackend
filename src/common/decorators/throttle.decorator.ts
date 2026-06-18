import { SetMetadata } from '@nestjs/common';

export const Throttle = (limit: number, ttl: number) =>
  SetMetadata('custom_throttle', { limit, ttl });