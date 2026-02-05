import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject('LoggerService') private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log toutes les requêtes réussies (2xx)
          if (statusCode >= 200 && statusCode < 300) {
            this.logger.log(
              `[${method}] ${url} - ${statusCode} - ${duration}ms`,
              'HttpRequest',
            );
          }

          // Log les redirections (3xx) comme info
          if (statusCode >= 300 && statusCode < 400) {
            this.logger.log(
              `[${method}] ${url} - ${statusCode} - ${duration}ms (redirect)`,
              'HttpRequest',
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log les erreurs client (4xx) comme warn
          if (statusCode >= 400 && statusCode < 500) {
            this.logger.warn(
              `[${method}] ${url} - ${statusCode} - ${duration}ms - ${error.message}`,
              'HttpRequest',
            );
          }

          // Les erreurs serveur (5xx) sont déjà loguées par GlobalExceptionFilter
        },
      }),
    );
  }
}
