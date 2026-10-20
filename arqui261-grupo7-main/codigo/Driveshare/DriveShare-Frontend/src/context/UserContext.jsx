// src/context/UserContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; 
import { 
    loginUsuario, 
    createUsuario, 
    verificarCodigoUsuario, 
    solicitarRecuperacion, 
    restablecerPassword, 
    cambiarPasswordUsuario,
    actualizarUsuarioPerfil 
} from '../components/services/api'; 

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const verificarSesion = () => {
            const params = new URLSearchParams(window.location.search);
            const tokenDesdeUrl = params.get('token');

            if (tokenDesdeUrl) {
                try {
                    const base64Url = tokenDesdeUrl.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const datosUsuario = JSON.parse(window.atob(base64));

                    const datosAdaptados = {
                        ...datosUsuario,
                        dni: datosUsuario.document_id || datosUsuario.dni || null,
                        telefono: datosUsuario.phone || datosUsuario.telefono || null,
                        nombre: datosUsuario.name || datosUsuario.nombre,
                        apellido: datosUsuario.lastname || datosUsuario.apellido
                    };

                    localStorage.setItem("token", tokenDesdeUrl);
                    localStorage.setItem("usuario", JSON.stringify(datosAdaptados));
                    
                    // 🌟 SOLUCIÓN CRÍTICA 1: Inyectar inmediatamente el token a Axios para que el Onboarding no falle
                    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenDesdeUrl}`;
                    
                    setUser(datosAdaptados);

                    // Limpiar la URL de forma elegante
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error("❌ Error decodificando token de Google:", error);
                }
            } else {
                const usuarioGuardado = localStorage.getItem("usuario");
                const tokenGuardado = localStorage.getItem("token");
                
                if (usuarioGuardado && tokenGuardado) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`;
                    setUser(JSON.parse(usuarioGuardado));
                }
            }
            setLoading(false);
        };

        verificarSesion();
    }, []);

    // 1. LOGIN TRADICIONAL
    const login = async (email, password) => {
        try {
            const data = await loginUsuario({ email, password });

            if (data && data.token) {
                const usuarioAdaptado = {
                    ...data.usuario,
                    dni: data.usuario.document_id || data.usuario.dni,
                    telefono: data.usuario.phone || data.usuario.telefono,
                    nombre: data.usuario.name || data.usuario.nombre,
                    apellido: data.usuario.lastname || data.usuario.apellido,
                    avatar_url:
                            data.usuario.avatar_url ||
                            data.usuario.avatar ||
                            null
                };

                localStorage.setItem("token", data.token);
                localStorage.setItem("usuario", JSON.stringify(usuarioAdaptado));
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setUser(usuarioAdaptado);
                return usuarioAdaptado;
            } else {
                alert(data.message || "Credenciales incorrectas.");
                return null;
            }
        } catch (error) {
            console.error("❌ Error en el proceso de login:", error);
            alert(error.response?.data?.message || "Error al conectar con el servidor.");
            return null;
        }
    };

    // 2. REGISTRO
    const register = async (datosRegistro) => {
        try {
            const data = await createUsuario(datosRegistro);
            if (data && data.success) {
                return { success: true, message: data.message };
            } else {
                alert(data?.message || "Error al registrar usuario.");
                return { success: false, message: data?.message };
            }
        } catch (error) {
            console.error("❌ Error en proceso de registro contextual:", error);
            alert(error.response?.data?.message || "Error al conectar con el servidor de registro.");
            return { success: false };
        }
    };

    // 2.5. VERIFICAR CÓDIGO
    const verifyAccount = async (email, codigo) => {
        try {
            const data = await verificarCodigoUsuario({ email, codigo });
            
            if (data && data.success) {
                const usuarioAdaptado = {
                    ...data.usuario,
                    dni: data.usuario.document_id || data.usuario.dni,
                    telefono: data.usuario.phone || data.usuario.telefono,
                    nombre: data.usuario.name || data.usuario.nombre,
                    apellido: data.usuario.lastname || data.usuario.apellido,
                    avatar_url:
                            data.usuario.avatar_url ||
                            data.usuario.avatar ||
                            null
                };

                localStorage.setItem("token", data.token);
                localStorage.setItem("usuario", JSON.stringify(usuarioAdaptado));
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setUser(usuarioAdaptado);
                return { success: true, usuario: usuarioAdaptado };
            } else {
                alert(data.message || "El código ingresado es incorrecto.");
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("❌ Error en el proceso de verificación contextual:", error);
            alert(error.response?.data?.message || "Error al conectar con el servidor de verificación.");
            return { success: false };
        }
    };

    // 🛠️ 3. ACTUALIZAR PERFIL REAL (Adaptado para forzar la actualización con Google)
    const updateProfile = async (datosActualizacion) => {
        try {
            const tokenGuardado = localStorage.getItem("token");

            if (!tokenGuardado) {
                return { success: false, message: "No se encontró un token de sesión válido." };
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`;
            
            const usuarioPrevio = user || JSON.parse(localStorage.getItem("usuario")) || {};
            
            // 🌟 ESTRATEGIA DE RESCATE: Si no hay id numérico en el token de Google, 
            // le adjuntamos el email de forma explícita al payload para que el controlador pueda usarlo de respaldo.
            const payloadConIdentificador = {
                ...datosActualizacion,
                id: usuarioPrevio.id || usuarioPrevio.id_user || null,
                email: usuarioPrevio.email || null
            };

            const respuestaBackend = await actualizarUsuarioPerfil(payloadConIdentificador);
            const nuevoToken = respuestaBackend?.token || tokenGuardado;
            
            let usuarioActualizado = {};

            if (respuestaBackend?.usuario) {
                const dbUser = respuestaBackend.usuario;
                usuarioActualizado = {
                    ...usuarioPrevio,
                    ...dbUser,
                    dni: dbUser.document_id || dbUser.dni || datosActualizacion.document_id,
                    telefono: dbUser.phone || dbUser.telefono || datosActualizacion.phone,
                    nombre: dbUser.name || dbUser.nombre || usuarioPrevio.nombre,
                    apellido: dbUser.lastname || dbUser.apellido || usuarioPrevio.apellido,
                    role: dbUser.role || usuarioPrevio.role,
                     avatar_url:
                            dbUser.avatar_url ||
                            usuarioPrevio.avatar_url ||
                            usuarioPrevio.avatar ||
                            null
                };
            } else {
                usuarioActualizado = { 
                    ...usuarioPrevio, 
                    ...datosActualizacion,
                    document_id: datosActualizacion.document_id || usuarioPrevio?.document_id || usuarioPrevio?.dni,
                    dni: datosActualizacion.document_id || usuarioPrevio?.dni,
                    phone: datosActualizacion.phone || usuarioPrevio?.phone || usuarioPrevio?.telefono,
                    telefono: datosActualizacion.phone || usuarioPrevio?.telefono,
                    driver_license: datosActualizacion.driver_license || usuarioPrevio?.driver_license,
                    license_expiration: datosActualizacion.license_expiration || usuarioPrevio?.license_expiration,
                    avatar_url:
                        datosActualizacion.avatar_url ||
                        usuarioPrevio.avatar_url ||
                        usuarioPrevio.avatar ||
                        null
                };
            }

            localStorage.setItem("token", nuevoToken);
            localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            axios.defaults.headers.common['Authorization'] = `Bearer ${nuevoToken}`;
            
            setUser(usuarioActualizado);

            return { success: true };
        } catch (error) {
            console.error("❌ Error en updateProfile Context:", error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    // 4. ACTUALIZACIÓN DE CONTRASEÑA
    const updatePassword = async (passwordActual, passwordNueva) => {
        try {
            const usuarioActualEnMemoria = user || JSON.parse(localStorage.getItem("usuario"));
            const id_user = usuarioActualEnMemoria?.id || usuarioActualEnMemoria?.id_user;

            if (!id_user) {
                return { success: false, message: "No se encontró una sesión activa de usuario." };
            }

            const resultado = await cambiarPasswordUsuario(id_user, passwordActual, passwordNueva);
            if (resultado && resultado.success) {
                return { success: true };
            }
            return { success: false, message: resultado?.message || "No se pudo actualizar la contraseña." };
        } catch (error) {
            console.error("❌ Error en updatePassword Context:", error);
            return { success: false, message: error.response?.data?.message || "Error al conectar con el servicio de credenciales." };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization']; 
        if (window.history.replaceState) {
            window.history.replaceState({}, document.title, '/login');
        }
        window.location.replace('/login');
    };

    const recoverPassword = async (email) => {
        try {
            const data = await solicitarRecuperacion(email);
            return data; 
        } catch (error) {
            console.error("Error recuperación:", error);
            return null;
        }
    };

    const resetPasswordCtx = async (email, newPassword) => {
        try {
            const data = await restablecerPassword(email, newPassword);
            return data;
        } catch (error) {
            console.error("Error reset password:", error);
            return null;
        }
    };
    
    const value = {
        user,
        usuario: user, 
        loading, 
        login,            
        register,
        verifyAccount, 
        updateProfile, 
        updatePassword, 
        recoverPassword,
        resetPassword: resetPasswordCtx ,
        logout
    };

    return (
        <UserContext.Provider value={value}>
            {!loading && children} 
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}