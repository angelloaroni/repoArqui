// src/routes/UsuarioRoutes.js

import express from 'express';
import passport from 'passport';

import controller from '../controllers/UsuarioController.js';

import authMiddleware from '../middlewares/AuthMiddleware.js';
import loginLimiter from '../middlewares/RateLimitMiddleware.js';

import auditService from '../integration/audit/AuditService.js';

const router = express.Router();

// ==========================================================
// 🔓 RUTAS PÚBLICAS
// ==========================================================

// Login protegido con Rate Limiter
router.post(
  '/login',
  loginLimiter,
  controller.login
);

// Registro protegido con Rate Limiter
router.post(
  '/registrar',
  loginLimiter,
  controller.create
);

// Verificación de cuenta
router.post(
  '/verificar-cuenta',
  controller.verificarCuenta
);

// Recuperación de contraseña protegida con Rate Limiter
router.post(
  '/recuperar-password',
  loginLimiter,
  controller.solicitarRecuperacion
);

// Restablecimiento de contraseña
router.post(
  '/reset-password',
  controller.restablecerPassword
);

// ==========================================================
// 🌐 GOOGLE OAUTH
// ==========================================================

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/auth/callback/google',

  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login?error=oauth_cancel',
    session: false
  }),

  async (req, res) => {

    try {

      await auditService.audit({

        req,

        usuario: req.user,

        action: req.user?.esNuevoUsuario
          ? 'REGISTER_GOOGLE'
          : 'LOGIN_GOOGLE',

        description: req.user?.esNuevoUsuario
          ? 'Registro mediante Google OAuth.'
          : 'Inicio de sesión mediante Google OAuth.',

        statusCode: 200

      });

    } catch (error) {

      console.warn(
        '⚠️ No se pudo registrar la auditoría de Google:',
        error.message
      );

    }

    const token = req.user?.token;

    if (token) {

      return res.redirect(
        `http://localhost:5173/oauth-success?token=${token}`
      );

    }

    return res.redirect(
      'http://localhost:5173/login?error=no_token'
    );

  }

);

// ==========================================================
// 🛡️ RUTAS PROTEGIDAS
// ==========================================================

router.put(
  '/:id/estado',
  authMiddleware,
  controller.cambiarEstado
);

// ==========================================================
// 🚫 AUDITORÍA DE ACCESO DENEGADO POR ROL
// ==========================================================

router.post(
  '/role-access-denied',
  authMiddleware,
  controller.roleAccessDenied
);

router.get(
  '/',
  authMiddleware,
  controller.findAll
);

router.get(
  '/:id',
  authMiddleware,
  controller.findOne
);

router.put(
  '/',
  authMiddleware,
  controller.update
);

router.delete(
  '/:id',
  authMiddleware,
  controller.remove
);

router.put(
  '/:id/password',
  authMiddleware,
  controller.changePassword
);

export default router;