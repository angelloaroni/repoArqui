// src/services/UsuarioService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js'; // Tu modelo real que mapea a la tabla USER
import { decrypt } from '../integration/encryption.js';

// 💾 ALMACENAMIENTO TEMPORAL EN MEMORIA (Para validar tokens y activaciones en desarrollo)
const tokensTemporales = new Map(); 
const codigosActivacion = new Map(); 

// ==========================================================
// 🔑 GENERAR TOKEN COMPLETO (CORREGIDO PARA EL ONBOARDING)
// ==========================================================
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id_user: usuario.id_user,
      email: usuario.email,
      name: usuario.name,
      lastname: usuario.lastname,
      role: usuario.role
    },
    process.env.JWT_SECRET || 'CLAVE_SUPER_SECRETA_CAMBIAR_LUEGO',
    { expiresIn: '24h' }
  );
};

// 🌐 FLUJO HÍBRIDO: Buscar o Registrar automáticamente desde el perfil de Google
const loginOrRegisterWithGoogle = async (profile) => {
  try {
    const { id: googleId, emails, name, photos } = profile; 
    const email = emails[0].value; 
    const nameGiven = name.givenName || 'Usuario'; 
    const lastnameGiven = name.familyName || 'Google'; 
    const avatarUrl = photos && photos[0] ? photos[0].value : null; 

    // 1. Buscar si ya existe el usuario por email
    let usuario = await Usuario.findOne({ where: { email } });

    if (usuario) {
      // Si ya existe pero no tiene google_id asignado (se registró local antes), lo vinculamos
      if (!usuario.google_id) {
        usuario.google_id = googleId;
        usuario.provider = 'google';
        if (avatarUrl && !usuario.avatar_url) usuario.avatar_url = avatarUrl;
        await usuario.save();
      }
    } else {
      // 2. Si no existe, lo creamos automáticamente (Registro vía Google)
      usuario = await Usuario.create({
        email,
        name: nameGiven,
        lastname: lastnameGiven,
        google_id: googleId,
        provider: 'google',
        avatar_url: avatarUrl,
        status: 'active', // Activo por defecto al venir verificado de Google
        role: 'arrendatario' // Rol por defecto, se puede cambiar luego
      });
    }

    try {

        usuario.phone =
            await decrypt(usuario.phone);

        usuario.document_id =
            await decrypt(usuario.document_id);

        usuario.driver_license =
            await decrypt(usuario.driver_license);

    } catch (error) {

        console.warn(
            '⚠️ No fue posible descifrar algunos datos.'
        );

    }


    // Generamos el token dinámico con todos sus datos de la base de datos
    const token = generarToken(usuario);

    return {
      success: true,
      token,
      usuario
    };
  } catch (error) {
    console.error('ERROR IN GOOGLE AUTH SERVICE:', error);
    return { success: false, message: 'Error en la autenticación con Google.' };
  }
};

// ============ REGISTRAR CUENTA LOCAL ============
const registrar = async (datosRegistro) => {
  try {
    // 🌟 CORRECCIÓN: Ahora desestructuramos el 'role' enviado desde el Front
    const { email, password, nombre, apellido, role } = datosRegistro;

    if (!email || !password || !nombre || !apellido) {
      return { success: false, message: 'Faltan campos mandatorios.' };
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await Usuario.create({
      email,
      password_hash,
      name: nombre,
      lastname: apellido,
      provider: 'local',
      status: 'pending', // Esperando verificación por código de email
      role: role || 'arrendatario' // 🌟 CORRECCIÓN: Asigna dinámicamente el rol seleccionado
    });

    return {
      success: true,
      message: 'Usuario creado. Código de verificación requerido.',
      usuario: nuevoUsuario
    };
  } catch (error) {
    console.error('ERROR EN SERVICE REGISTRAR:', error);
    return { success: false, message: 'Error interno al registrar el usuario.' };
  }
};


// ============ LOGIN LOCAL ============
const login = async (credenciales) => {
  try {

    const { email, password } = credenciales;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return {
        success: false,
        message: 'El correo electrónico no existe.'
      };
    }

    if (usuario.status === 'pending') {
      return {
        success: false,
        message: 'Por favor, verifica tu cuenta antes de iniciar sesión.'
      };
    }

    if (usuario.status === 'suspended') {
      return {
        success: false,
        message: 'Tu cuenta se encuentra suspendida temporalmente.'
      };
    }

    if (usuario.provider === 'google' && !usuario.password_hash) {
      return {
        success: false,
        message: 'Esta cuenta utiliza autenticación de Google. Inicia sesión con Google.'
      };
    }

    const match = await bcrypt.compare(password, usuario.password_hash);

    if (!match) {
      return {
        success: false,
        message: 'La contraseña es incorrecta.'
      };
    }

    try {

      usuario.phone =
        await decrypt(usuario.phone);

      usuario.document_id =
        await decrypt(usuario.document_id);

      usuario.driver_license =
        await decrypt(usuario.driver_license);

    } catch (error) {

      console.warn(
        '⚠️ No fue posible descifrar algunos datos del usuario.'
      );

    }

    const token = generarToken(usuario);

    return {

      success: true,

      message: 'Inicio de sesión exitoso.',

      token,

      usuario

    };

  } catch (error) {

    console.error('ERROR EN SERVICE LOGIN:', error);

    return {

      success: false,

      message: 'Error interno en el servidor durante el login.'

    };

  }
};

// ==========================================================
// 🔑 CAMBIAR CONTRASEÑA EN LA BD (CORREGIDO PARA ID_USER)
// ==========================================================
const changePassword = async (id_user, passwordActual, passwordNueva) => {
  try {
    const usuario = await Usuario.findOne({ where: { id_user } });
    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    if (usuario.password_hash) {
      const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
      if (!isMatch) {
        return { success: false, message: 'La contraseña actual es incorrecta.' };
      }
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(passwordNueva, salt);
    await usuario.save();

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  } catch (error) {
    console.error('ERROR EN SERVICE CHANGE PASSWORD:', error);
    return { success: false, message: 'Error interno en el servidor.' };
  }
};

// ============ SOLICITAR RECUPERACIÓN DE CONTRASEÑA ============
const solicitarRecuperacionPassword = async (email) => {
  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return { success: false, message: 'No existe un usuario con ese correo electrónico.' };
    }

    const tokenRecuperacion = Math.floor(100000 + Math.random() * 900000).toString();
    tokensTemporales.set(email, tokenRecuperacion);

    return {
      success: true,
      message: 'Código de recuperación generado con éxito.',
      codigo: tokenRecuperacion
    };
  } catch (error) {
    console.error('ERROR SOLICITAR RECUPERACION:', error);
    return { success: false, message: 'Error al procesar la solicitud.' };
  }
};

// ============ RESTABLECER CONTRASEÑA CON CÓDIGO ============
const restablecerPassword = async (email, codigoRecibido, newPassword) => {
  try {
    const tokenGuardado = tokensTemporales.get(email);

    if (!tokenGuardado || tokenGuardado !== codigoRecibido) {
      return { success: false, message: 'El código es inválido o ha expirado.' };
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(newPassword, salt);
    await usuario.save();

    tokensTemporales.delete(email);

    return { success: true, message: 'Contraseña restablecida exitosamente.' };
  } catch (error) {
    console.error('ERROR RESTABLECER PASSWORD:', error);
    return { success: false, message: 'Error al restablecer la contraseña.' };
  }
};

// ============ VERIFICAR Y ACTIVAR CUENTA LOCAL ============
const verificarCuenta = async (email, codigoEnviado) => {

  try {

    const codigoCorrecto =
      codigosActivacion.get(email);

    if (!codigoCorrecto ||
        codigoCorrecto !== codigoEnviado) {

      return {

        success: false,

        message:
          'El código de activación es incorrecto o ya expiró.'

      };

    }

    const usuario =
      await Usuario.findOne({

        where: { email }

      });

    if (!usuario) {

      return {

        success: false,

        message:
          'Usuario no encontrado.'

      };

    }

    usuario.status = 'active';

    await usuario.save();

    codigosActivacion.delete(email);

    try {

      usuario.phone =
        await decrypt(usuario.phone);

      usuario.document_id =
        await decrypt(usuario.document_id);

      usuario.driver_license =
        await decrypt(usuario.driver_license);

    } catch (error) {

      console.warn(
        '⚠️ No fue posible descifrar algunos datos.'
      );

    }

    const token =
      generarToken(usuario);

    return {

      success: true,

      message:
        'Tu cuenta ha sido verificada y activada exitosamente.',

      token,

      usuario

    };

  } catch (error) {

    console.error(
      'ERROR VERIFICAR CUENTA:',
      error
    );

    return {

      success: false,

      message:
        'Error al verificar la cuenta.'

    };

  }

};

export default {
  registrar,
  login,
  loginOrRegisterWithGoogle, 
  changePassword,
  solicitarRecuperacionPassword,
  restablecerPassword,
  verificarCuenta,
  generarToken, 
  codigosActivacion
};