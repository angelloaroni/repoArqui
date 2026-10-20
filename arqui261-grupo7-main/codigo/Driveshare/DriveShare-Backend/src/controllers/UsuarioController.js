// src/controllers/UsuarioController.js
import repository from '../repositories/UsuarioRepository.js';
import usuarioService from '../services/UsuarioService.js';
import bcrypt from 'bcryptjs';
import {
    encrypt,
    decrypt
} from '../integration/encryption.js';
import auditService from '../integration/audit/AuditService.js';
import mailService from '../integration/mail/MailService.js';

// ================= LISTAR ==================
const findAll = async (req, res) => {

    const respuesta = await repository.findAll();

    if (respuesta?.length) {

        for (const usuario of respuesta) {

            usuario.phone =
                await decrypt(usuario.phone);

            usuario.document_id =
                await decrypt(usuario.document_id);

            usuario.driver_license =
                await decrypt(usuario.driver_license);

        }

    }

    return sendResults(
        respuesta,
        res,
        'No se han encontrado usuarios.'
    );

};

// ================= BUSCAR UNO ================
const findOne = async (req, res) => {

  const id = req.params.id;

  const result = await repository.findOne(id);

  // ==================== DESCIFRADO RSA ====================
  if (result) {

    result.phone = await decrypt(result.phone);

    result.document_id = await decrypt(result.document_id);

    result.driver_license = await decrypt(result.driver_license);

  }

  return sendResults(result, res, 'Usuario no encontrado.');

};

// ================= CREAR / REGISTRAR CUENTA ===========
const create = async (req, res) => {

  const nombre = req.body.nombre || req.body.name;
  const apellido = req.body.apellido || req.body.lastname;

  const { email, password, role } = req.body;

  if (!email || !password || !nombre || !apellido) {

    return res.status(400).json({

      success: false,

      message:
        'Faltan campos mandatorios en la petición (email, password, nombre o apellido).'

    });

  }

  const result = await usuarioService.registrar({

    email,

    password,

    nombre,

    apellido,

    role

  });

  if (!result.success) {

    return res.status(400).json({

      success: false,

      message: result.message

    });

  }

  const createdObj = result.usuario;

  try {

    const codigoActivacion =
      Math.floor(100000 + Math.random() * 900000).toString();

    usuarioService.codigosActivacion.set(

      createdObj.email,

      codigoActivacion

    );

    await mailService.sendActivationEmail(

      createdObj,

      codigoActivacion

    );

  }

  catch (emailError) {

    console.error(

      '❌ Error enviando correo de activación:',

      emailError.message

    );

  }

  await auditService.audit({

    req,

    usuario: createdObj,

    action: 'REGISTER',

    description: 'Usuario registrado correctamente.',

    statusCode: 201

  });

  return res.status(201).json({

    success: true,

    message: result.message,

    usuario: createdObj

  });

};

// ==========================================================
// 📝 ACTUALIZAR PERFIL / ONBOARDING (ESTABILIZADO AMBOS FLUJOS)
// ==========================================================
const update = async (req, res) => {

  // 1. Extraer ID de los tokens (Manual o Google Passport)
  let idFinal =
    req.usuario?.id_user ||
    req.usuario?.id ||
    req.user?.id_user ||
    req.user?.id ||
    req.body.id ||
    req.body.id_user;

  const datosFrontend = req.body;

  try {

    let usuario = null;

    // PRIORIDAD 1: Si obtuvimos un ID del token
    if (idFinal) {
      usuario = await repository.findOne(idFinal);
    }

    // PRIORIDAD 2: Buscar por email (Google OAuth)
    if (!usuario && datosFrontend.email) {

      console.log(`🔍 Buscando usuario de respaldo por Email: ${datosFrontend.email}`);

      usuario = await repository.findByEmail(datosFrontend.email);

      if (usuario) {
        idFinal = usuario.id_user || usuario.id;
      }

    }

    // Si no encontramos usuario
    if (!usuario || !idFinal) {

      return res.status(401).json({
        success: false,
        message: 'No se pudo identificar la sesión del usuario en el sistema.'
      });

    }

    // ==========================================================
    // 🔐 CIFRADO RSA
    // ==========================================================

    const encryptedPhone =
      (datosFrontend.telefono || datosFrontend.phone)
        ? await encrypt(
            datosFrontend.telefono || datosFrontend.phone
          )
        : usuario.phone;

    const encryptedDocument =
      (datosFrontend.dni || datosFrontend.document_id)
        ? await encrypt(
            datosFrontend.dni || datosFrontend.document_id
          )
        : usuario.document_id;

    const encryptedLicense =
      datosFrontend.driver_license
        ? await encrypt(datosFrontend.driver_license)
        : usuario.driver_license;

    // ==========================================================
    // DATOS A ACTUALIZAR
    // ==========================================================

    const datosMapeadosBD = {

      id_user: Number(idFinal),

      name:
        datosFrontend.nombre ||
        datosFrontend.name ||
        usuario.name,

      lastname:
        datosFrontend.apellido ||
        datosFrontend.lastname ||
        usuario.lastname,
      
      role:
        datosFrontend.role ||
        usuario.role,

      gender:
        datosFrontend.gender ||
        usuario.gender,

      driver_license:
        encryptedLicense,

      license_expiration:
        datosFrontend.license_expiration ||
        usuario.license_expiration,

      birth_date:
        datosFrontend.birth_date ||
        usuario.birth_date,

      nationality:
        datosFrontend.nationality ||
        usuario.nationality,

      document_id:
        encryptedDocument,

      phone:
        encryptedPhone,

      avatar_url:
        datosFrontend.avatar_url ||
        datosFrontend.avatar ||
        usuario.avatar_url,

    };

    console.log(`💾 Guardando en PostgreSQL para id_user: ${idFinal}`);

    // ==========================================================
    // GUARDAR
    // ==========================================================

    await repository.update(datosMapeadosBD);

    // ==========================================================
    // CONSULTAR USUARIO ACTUALIZADO
    // ==========================================================

    const usuarioActualizado = await repository.findOne(idFinal);

    // ==========================================================
    // 🔓 DESCIFRADO RSA
    // ==========================================================

      try {

          usuarioActualizado.phone =
              await decrypt(usuarioActualizado.phone);

          usuarioActualizado.document_id =
              await decrypt(usuarioActualizado.document_id);

          usuarioActualizado.driver_license =
              await decrypt(usuarioActualizado.driver_license);

      } catch (error) {

          console.warn("⚠️ No fue posible descifrar algunos datos del usuario.");

      }

    console.log("✅ Actualización exitosa en BD:", usuarioActualizado?.email);

    // ==========================================================
    // NUEVO TOKEN
    // ==========================================================

    const nuevoToken =
      usuarioService.generarToken
        ? usuarioService.generarToken(usuarioActualizado)
        : null;
    
    await auditService.audit({
        req,
        usuario: usuarioActualizado,
        action: 'UPDATE_PROFILE',
        description: 'Perfil y documentación actualizados correctamente.',
        statusCode: 200
    });  


    return res.status(200).json({

      success: true,

      message:
        '¡Perfil y documentación actualizados con éxito en DriveShare!',

      usuario: usuarioActualizado,

      token: nuevoToken

    });

  } catch (error) {

    console.error('❌ Error crítico en UsuarioController.update:', error);

    return res.status(500).json({

      success: false,

      message:
        'Error al procesar la actualización del Onboarding.',

      error: error.message

    });

  }

};

// ================= ELIMINAR ==================
  const remove = async (req, res) => {

    const id = req.params.id;

    const result = await repository.remove(id);

    if (result) {

      await auditService.audit({

        req,

        usuario: {
          id_user: id
        },

        action: 'DELETE_ACCOUNT',

        description: 'Cuenta eliminada correctamente.',

        statusCode: 200

      });

    }

    return sendResults(
      result,
      res,
      'No se pudo eliminar el usuario o no existe.'
    );

  };

// ============ INICIAR SESIÓN LOCAL ============
const login = async (req, res) => {
  const result = await usuarioService.login(req.body);

  if (result.success) {
    await auditService.audit({
        req,
        usuario: result.usuario,
        action: 'LOGIN',
        description: 'Inicio de sesión exitoso.',
        statusCode: 200

    });


    return res.status(200).json({
      success: true,
      message: result.message,
      token: result.token,
      usuario: result.usuario
    });
  }
  
  return res.status(401).json({ success: false, message: result.message });
};

// ============ MODIFICAR CONTRASEÑA ============
const changePassword = async (req, res) => {

    const { id_user, passwordActual, passwordNueva } = req.body;

    if (!id_user || !passwordActual || !passwordNueva) {

        return res.status(400).json({

            success: false,

            message: 'Faltan campos mandatorios.'

        });

    }

    const result =
        await usuarioService.changePassword(
            id_user,
            passwordActual,
            passwordNueva
        );

    if (!result.success) {

        return res.status(400).json(result);

    }

    const usuario =
        await repository.findOne(id_user);

    try {

        await mailService.sendPasswordChangedEmail(
            usuario
        );

    }

    catch (error) {

        console.error(

            '❌ Error enviando correo de cambio de contraseña:',

            error.message

        );

    }

    await auditService.audit({

        req,

        usuario,

        action: 'CHANGE_PASSWORD',

        description: 'Contraseña modificada correctamente.',

        statusCode: 200

    });

    return res.status(200).json(result);

};

// ============ SOLICITAR RECUPERACIÓN ============
const solicitarRecuperacion = async (req, res) => {

    const { email } = req.body;

    if (!email) {

        return res.status(400).json({

            message: 'El campo email es requerido.'

        });

    }

    const result =
        await usuarioService.solicitarRecuperacionPassword(email);

    if (!result.success) {

        return res.status(400).json(result);

    }

    const usuario =
        await repository.findByEmail(email);

    try {

        await mailService.sendRecoveryEmail(

            usuario,

            result.codigo

        );

    }

    catch (error) {

        console.error(

            '❌ Error enviando correo de recuperación:',

            error.message

        );

    }

    await auditService.audit({

        req,

        usuario: {

            id_user: usuario?.id_user,

            email

        },

        action: 'REQUEST_PASSWORD_RESET',

        description: 'Solicitud de recuperación de contraseña.',

        statusCode: 200

    });

    return res.status(200).json(result);

};

// ============ RESTABLECER CONTRASEÑA ============
const restablecerPassword = async (req, res) => {

    const { email, codigo, newPassword } = req.body;

    if (!email || !codigo || !newPassword) {

        return res.status(400).json({

            message: 'Faltan datos obligatorios (email, codigo, newPassword).'

        });

    }

    const result =
        await usuarioService.restablecerPassword(
            email,
            codigo,
            newPassword
        );

    if (!result.success) {

        return res.status(400).json(result);

    }

    const usuario =
        await repository.findByEmail(email);

    try {

        await mailService.sendPasswordResetSuccessEmail(
            usuario
        );

    }

    catch (error) {

        console.error(

            '❌ Error enviando correo de confirmación de restablecimiento:',

            error.message

        );

    }

    await auditService.audit({

        req,

        usuario,

        action: 'RESET_PASSWORD',

        description: 'Contraseña restablecida correctamente.',

        statusCode: 200

    });

    return res.status(200).json(result);

};

// ============ VERIFICAR CUENTA ==============
const verificarCuenta = async (req, res) => {

    const { email, codigo } = req.body;

    if (!email || !codigo) {

        return res.status(400).json({
            message: 'Faltan datos obligatorios (email, codigo).'
        });

    }

    const result =
        await usuarioService.verificarCuenta(email, codigo);

    if (!result.success) {

        return res.status(400).json(result);

    }

    try {

        await mailService.sendAccountVerifiedEmail(
            result.usuario
        );

    }

    catch (error) {

        console.error(
            '❌ Error enviando correo de confirmación:',
            error.message
        );

    }

    await auditService.audit({

        req,

        usuario: result.usuario,

        action: 'VERIFY_ACCOUNT',

        description: 'Cuenta verificada correctamente.',

        statusCode: 200

    });

    return res.status(200).json(result);

};

// ============ ACTUALIZAR ESTADO ======================
const cambiarEstado = async (req, res) => {

    const { id } = req.params;

    const { estado } = req.body;

    try {

        const usuarioActualizado =
            await usuarioService.cambiarEstadoUsuario(
                id,
                estado
            );

        try {

            await mailService.sendAccountStatusEmail(

                usuarioActualizado,

                estado

            );

        }

        catch (error) {

            console.error(

                '❌ Error enviando correo de cambio de estado:',

                error.message

            );

        }

        await auditService.audit({

            req,

            usuario: usuarioActualizado,

            action: 'CHANGE_STATUS',

            description: `Estado del usuario cambiado a "${estado}".`,

            statusCode: 200

        });

        return res.json(usuarioActualizado);

    }

    catch (error) {

        return res.status(404).json({

            message: error.message

        });

    }

};

// ============ RESPUESTA HELPER ======================
const sendResults = (result, res, unsuccessMessage) => {
  if (result) return res.status(200).json(result);
  return res.status(404).json({ message: unsuccessMessage });
};



// ============ ACCESO DENEGADO POR ROL ======================
const roleAccessDenied = async (req, res) => {

    try {

        const usuario =
            req.usuario ||
            req.user ||
            {};

        const {

            requiredRole,

            attemptedRoute

        } = req.body;

        await auditService.audit({

            req,

            usuario,

            action: 'ROLE_ACCESS_DENIED',

            description:
                `Intento de acceso no autorizado a "${attemptedRoute}". Rol requerido: ${requiredRole}.`,

            statusCode: 403

        });

        return res.status(200).json({

            success: true,

            message: 'Evento de auditoría registrado correctamente.'

        });

    }

    catch (error) {

        console.error(

            '❌ Error registrando ROLE_ACCESS_DENIED:',

            error.message

        );

        return res.status(500).json({

            success: false,

            message: 'No se pudo registrar la auditoría.'

        });

    }

};

// ============ EXPORTACIÓN COMPLETA ======================
export default {
  findAll,
  findOne,
  create,
  update,
  remove,
  login,
  changePassword,
  solicitarRecuperacion,
  restablecerPassword,
  verificarCuenta,
  cambiarEstado,
  roleAccessDenied
};