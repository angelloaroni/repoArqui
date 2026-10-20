export function sendSuccess(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function routeNotFound(req, res) {
  return res.status(404).json({
    success: false,
    message: 'El recurso solicitado no existe.',
    data: null,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const safeMessage =
    statusCode >= 500
      ? 'No fue posible completar la operación en el servidor de EventFlow.'
      : error.message;

  return res.status(statusCode).json({
    success: false,
    message: safeMessage,
    data: null,
  });
}

