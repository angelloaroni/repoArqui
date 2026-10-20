// src/components/services/api.js
import axios from 'axios';

// 🌐 Configuración global de Axios apuntando a tu backend de Node.js
const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api";

// Configura Axios para que incluya automáticamente el Token JWT si existe en el LocalStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================================
// 🔓 ENDPOINTS DE AUTENTICACIÓN TRADICIONAL
// ==========================================================

// 1. LOGIN REAL (Conecta con POST /api/login)
export const loginUsuario = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // Retorna { success: true, token, usuario }
  } catch (error) {
    console.error("❌ Error en Axios loginUsuario:", error);
    throw error;
  }
};

// 2. REGISTRO REAL (Conecta con POST /api/registrar)
export const createUsuario = async (datos) => {
  try {
    // 📦 Mapeamos los datos de identidad básica que decidimos capturar en el Registro
    const payloadBackend = {
      email: datos.email,
      password: datos.password,
      nombre: datos.nombre,     
      apellido: datos.apellido, 
      dni: datos.dni,           // ✨ Añadido para enviar al backend
      telefono: datos.telefono, // ✨ Añadido para enviar al backend
      role: datos.role          // ✨ Añadido para enviar el rol real (arrendatario/arrendador)
    };

    const response = await axios.post(`${API_URL}/registrar`, payloadBackend);
    return response.data; 
  } catch (error) {
    console.error("❌ Error en Axios createUsuario:", error);
    throw error;
  }
};

// 🌟 2.5. VERIFICAR CUENTA
export const verificarCodigoUsuario = async ({ email, codigo }) => {
  try {
    const response = await axios.post(`${API_URL}/verificar-cuenta`, { email, codigo });
    return response.data; // Retorna { success: true, token, usuario }
  } catch (error) {
    console.error("❌ Error en Axios verificarCodigoUsuario:", error);
    throw error;
  }
};

// ==========================================================
// 🔑 FLUJOS DE RECUPERACIÓN Y CONFIGURACIÓN DE CUENTA
// ==========================================================

// 3. SOLICITAR RECUPERACIÓN (Conecta con POST /api/recuperar-password)
export const solicitarRecuperacion = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/recuperar-password`, { email });
    return response.data;
  } catch (error) {
    console.error("❌ Error en Axios solicitarRecuperacion:", error);
    throw error;
  }
};

// 4. RESTABLECER CONTRASEÑA EXTERNA (Conecta con POST /api/reset-password)
export const restablecerPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { email, password: newPassword });
    return response.data;
  } catch (error) {
    console.error("❌ Error en Axios restablecerPassword:", error);
    throw error;
  }
};

// 5. CAMBIO DE CONTRASEÑA INTERNO (se hace desde la pagina de perfil)
export const cambiarPasswordUsuario = async (

    id_user,

    passwordActual,

    passwordNueva

) => {

    try {

        const response = await axios.put(

            `${API_URL}/${id_user}/password`,

            {

                id_user,

                passwordActual,

                passwordNueva

            }

        );

        return response.data;

    }

    catch (error) {

        console.error(

            "❌ Error en Axios cambiarPasswordUsuario:",

            error

        );

        throw error;

    }

};

// 🌟 6. ACTUALIZAR PERFIL / ONBOARDING (Conecta con PUT /api)
// 🌟 CORRECCIÓN: Se remueve completamente el id_user de los argumentos de la función.
export const actualizarUsuarioPerfil = async (datosActualizacion) => {
  try {
    const response = await axios.put(`${API_URL}`, datosActualizacion);
    return response.data;
  } catch (error) {
    console.error("❌ Error en Axios actualizarUsuarioPerfil:", error);
    throw error;
  }
};

// ==========================================================
// 🚫 REGISTRAR ACCESO DENEGADO POR ROL
// ==========================================================

export const registrarRoleAccessDenied = async (

    requiredRole,

    attemptedRoute

) => {

    try {

        const response = await axios.post(

            `${API_URL}/role-access-denied`,

            {

                requiredRole,

                attemptedRoute

            }

        );

        return response.data;

    }

    catch (error) {

        console.error(

            "❌ Error registrando ROLE_ACCESS_DENIED:",

            error

        );

        throw error;

    }

};