import { SetMetadata } from '@nestjs/common';

export const Throttle = (limit: number, ttl: number) =>
  SetMetadata('throttle', { limit, ttl: ttl * 1000 }); 

export const SkipThrottle = () => SetMetadata('skipThrottle', true);