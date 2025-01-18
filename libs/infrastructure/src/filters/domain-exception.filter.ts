import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { UserAlreadyExistsError } from '@read-n-feed/application';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Translate domain error to HTTP code
    if (exception instanceof UserAlreadyExistsError) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: exception.name,
        message: exception.message,
      });
    }

    // fallback, or handle more errors:
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: exception.name,
      message: exception.message || 'Internal Server Error',
    });
  }
}
