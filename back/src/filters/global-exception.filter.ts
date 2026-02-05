import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject('LoggerService') private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: unknown = undefined;

    // Handle HTTP exceptions (NestJS built-in)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || message;
        error = (resp.error as string) || exception.name;
        details = resp.details;
      }
      error = exception.name || error;
    }
    // Handle Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      statusCode = prismaError.statusCode;
      message = prismaError.message;
      error = 'Database Error';
      details = { code: exception.code, meta: exception.meta };
    }
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided to database';
      error = 'Validation Error';
      details = exception.message;
    }
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection failed';
      error = 'Database Connection Error';
      this.logger.error('Database initialization error:', exception.message);
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      message = exception.message || message;
      error = exception.name || error;
      
      // Don't expose stack traces in production
      if (process.env.NODE_ENV !== 'production') {
        details = exception.stack;
      }
    }

    // Log the error
    this.logger.error(
      `[${request.method}] ${request.url} - ${statusCode} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details && process.env.NODE_ENV !== 'production') {
      errorResponse.details = details;
    }

    response.status(statusCode).json(errorResponse);
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): { statusCode: number; message: string } {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Duplicate entry: ${(error.meta?.target as string[])?.join(', ') || 'unique constraint violation'}`,
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
        };
      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid relation',
        };
      case 'P2021':
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Table does not exist',
        };
      case 'P2022':
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Column does not exist',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Database error: ${error.code}`,
        };
    }
  }
}
