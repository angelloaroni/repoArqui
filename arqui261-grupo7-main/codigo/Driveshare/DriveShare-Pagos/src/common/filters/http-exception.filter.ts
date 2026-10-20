import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

/** Da mensajes de error claros y consistentes al usuario (apoya RF35). */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const mensaje = exception instanceof HttpException
      ? exception.getResponse()
      : 'Error interno del servidor';

    this.logger.error(`(${status}) ${JSON.stringify(mensaje)}`);
    res.status(status).json({
      ok: false,
      statusCode: status,
      error: mensaje,
      timestamp: new Date().toISOString(),
    });
  }
}
