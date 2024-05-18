import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/*
This filter intercepts the API exceptions and formats them in a readable manner.
It also removes the tedious HttpExceptions checks in the controllers.
 */
@Catch()
export class ApiExceptionFilterFilter<T> implements ExceptionFilter {
  /**
   * Catch the exception and return a JSON object in a readable way.
   * @param exception Intercepted exception.
   * @param host Object for receiving arguments passed to the handler.
   */
  catch(exception: T, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.getStatus(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.getMessage(exception),
    });
  }

  /**
   * Gets the status code from HttpException or default to an internal server error (500)
   * @param exception Exception to retrieve status from.
   * @returns HttpException status code.
   */
  getStatus(exception: T): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Gets the message from HttpException or default to 'Internal Server Error'
   * @param exception Exception to retrieve message from.
   * @returns HttpException message.
   */
  getMessage(exception: T): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    return 'Internal Server Error';
  }
}
