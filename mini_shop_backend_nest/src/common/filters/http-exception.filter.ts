import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const normalizedError = this.normalizeError(exceptionResponse, statusCode);

    response.status(statusCode).json({
      statusCode,
      error: normalizedError.error,
      message: normalizedError.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeError(
    exceptionResponse: string | object | null,
    statusCode: number,
  ): Required<ErrorResponseBody> {
    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        error: this.getDefaultError(statusCode),
        message: exceptionResponse,
      };
    }

    if (this.isErrorResponseBody(exceptionResponse)) {
      return {
        statusCode: exceptionResponse.statusCode ?? statusCode,
        error: exceptionResponse.error ?? this.getDefaultError(statusCode),
        message: exceptionResponse.message ?? this.getDefaultError(statusCode),
      };
    }

    return {
      statusCode,
      error: this.getDefaultError(statusCode),
      message: this.getDefaultError(statusCode),
    };
  }

  private isErrorResponseBody(value: unknown): value is ErrorResponseBody {
    return typeof value === 'object' && value !== null;
  }

  private getDefaultError(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'Error';
  }
}
