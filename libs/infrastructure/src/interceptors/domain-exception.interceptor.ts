import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserAlreadyExistsError } from '@read-n-feed/application';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DomainExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: Error) => {
        if (err instanceof UserAlreadyExistsError) {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.CONFLICT,
                  error: err.name,
                  message: err.message,
                },
                HttpStatus.CONFLICT,
              ),
          );
        }
        return throwError(err); //@TODO: fix deprecated
      }),
    );
  }
}
