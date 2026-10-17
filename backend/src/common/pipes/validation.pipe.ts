import {
  UnprocessableEntityException,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';

export interface FieldError {
  field: string;
  constraints: string[];
}

/** Flattens (nested) class-validator errors into `{ field: 'a.b[0].c', constraints }`. */
export function flattenValidationErrors(
  errors: ValidationError[],
  parent = '',
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parent
      ? /^\d+$/.test(error.property)
        ? `${parent}[${error.property}]`
        : `${parent}.${error.property}`
      : error.property;
    const own: FieldError[] = error.constraints
      ? [{ field, constraints: Object.values(error.constraints) }]
      : [];
    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });
}

/**
 * Global request-body validation: unknown properties are rejected (whitelist +
 * forbidNonWhitelisted) and failures answer 422 with field-level details.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    errorHttpStatusCode: 422,
    exceptionFactory: (errors) => {
      const fieldErrors = flattenValidationErrors(errors);
      return new UnprocessableEntityException({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: fieldErrors.flatMap((e) => e.constraints),
        errors: fieldErrors,
      });
    },
  });
}
