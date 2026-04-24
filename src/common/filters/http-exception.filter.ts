import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const resp = body as Record<string, any>;
        if (Array.isArray(resp.message)) {
          errors = resp.message.map((m) => String(m));
          message =
            errors.length > 0 ? errors.join('; ') : 'Validation failed';
        } else {
          message = resp.message ?? message;
        }
      }
    } else {
      this.logger.error(
        `Unhandled exception [${req.method} ${req.url}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json({
      success: false,
      message,
      ...(errors !== undefined ? { errors } : {}),
    });
  }
}
