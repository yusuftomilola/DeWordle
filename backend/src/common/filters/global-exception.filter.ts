import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Centralizes every HTTP error into a consistent JSON shape:
 * { statusCode, message, error, timestamp, path }.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: string;
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const raw: unknown = exceptionResponse.message;
      message = Array.isArray(raw)
        ? raw.join(', ')
        : typeof raw === 'string'
          ? raw
          : JSON.stringify(raw);
      const rawError: unknown =
        'error' in exceptionResponse ? exceptionResponse.error : undefined;
      error =
        typeof rawError === 'string'
          ? rawError
          : rawError !== undefined
            ? JSON.stringify(rawError)
            : message;
    } else {
      // Unhandled error: the raw message can contain SQL, file paths or other
      // internals, so clients only see it outside production.
      message =
        process.env.NODE_ENV !== 'production' && exception instanceof Error
          ? exception.message
          : 'Internal server error';
      error = message;
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // The stack goes to the server log only, never into the response body.
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ErrorResponseBody = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }
}
