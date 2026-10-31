import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;
        message = (obj.message as string) || message;
        errors = obj.errors ?? obj.message;
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      // PrismaClientInitializationError when DB is unreachable/auth fails
      (exception as any).name === 'PrismaClientInitializationError'
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database unavailable. Check DATABASE_URL / credentials.';
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    res.status(status).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
