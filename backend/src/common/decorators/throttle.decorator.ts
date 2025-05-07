import { applyDecorators } from '@nestjs/common';
import { SkipThrottle as NestSkipThrottle } from '@nestjs/throttler';

/**
 * Custom Throttle decorator to apply rate limiting.
 * @param limit - Maximum number of requests allowed.
 * @param ttl - Time-to-live in seconds for the rate limit.
 */
export const Throttle = (limit: number, ttl: number) => {
  return applyDecorators();
};

/**
 * Custom SkipThrottle decorator to bypass rate limiting.
 */
export const SkipThrottle = () => {
  return applyDecorators(NestSkipThrottle());
};