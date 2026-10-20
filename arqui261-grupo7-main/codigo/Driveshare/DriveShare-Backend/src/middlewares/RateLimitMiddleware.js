import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({

    // Ventana de tiempo de 1 minuto
    windowMs: 60 * 1000,

    // Máximo 5 solicitudes por IP durante la ventana
    max: 5,

    // Envía información del límite mediante los headers estándar
    standardHeaders: true,

    // Deshabilita los headers antiguos
    legacyHeaders: false,

    // Código HTTP cuando se excede el límite
    statusCode: 429,

    // Respuesta personalizada
    message: {

        success: false,

        message:
            'Demasiados intentos. Intente nuevamente en un minuto.'

    }

});

export default loginLimiter;