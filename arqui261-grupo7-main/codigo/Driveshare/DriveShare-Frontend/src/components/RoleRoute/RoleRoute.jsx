// src/components/RoleRoute/RoleRoute.jsx

import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { registrarRoleAccessDenied } from '../services/api';
import { useRef } from 'react';

function RoleRoute({ children, allowedRole }) {

  // 🔌 Compatibilidad con ambas estructuras del UserContext
  const { user, usuario, loading } = useUser();
  const datosUsuario = user || usuario;
  const accesoDenegadoProcesado = useRef(false);

  // ⏳ Evita parpadeos mientras se recupera la sesión
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-gray-900 text-white"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0f172a',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <p className="text-lg font-semibold animate-pulse">
          Verificando permisos de rol...
        </p>
      </div>
    );
  }

  try {

    // ==========================================================
    // 1. VALIDAR AUTENTICACIÓN
    // ==========================================================

    if (!datosUsuario) {

      console.log('RoleRoute: Usuario no autenticado');

      return <Navigate to="/login" replace />;

    }

    // ==========================================================
    // 2. VALIDAR VERIFICACIÓN DE CUENTA
    // ==========================================================

    if (datosUsuario.status === 'pending_verification') {

      console.log(
        'RoleRoute: Cuenta no verificada.'
      );

      return <Navigate to="/verificar-cuenta" replace />;

    }

    // ==========================================================
    // 3. VALIDAR ONBOARDING
    // ==========================================================

    const tienePerfilIncompleto =

      (!datosUsuario.document_id && !datosUsuario.dni) ||

      !datosUsuario.driver_license;

    if (tienePerfilIncompleto) {

      console.log(
        'RoleRoute: Perfil incompleto.'
      );

      return <Navigate
        to="/usuario/onboarding"
        replace
      />;

    }

    // ==========================================================
    // 4. VALIDACIÓN DE ROL
    // ==========================================================

    const rolUsuario =
      (datosUsuario.role || '').toLowerCase();

    const rolPermitido =
      (allowedRole || '').toLowerCase();

    if (rolUsuario !== rolPermitido) {

      // Evita registrar la auditoría más de una vez
      if (accesoDenegadoProcesado.current) {
        return null;
      }

      accesoDenegadoProcesado.current = true;

      console.log(
        `Acceso denegado.
Rol actual: ${datosUsuario.role}.
Rol requerido: ${allowedRole}`
      );

      (async () => {

        try {

          await registrarRoleAccessDenied(

            allowedRole,

            window.location.pathname

          );

        }

        catch (error) {

          console.error(
            'Error registrando auditoría:',
            error
          );

        }

        alert(

          `🚫 Acceso denegado.\n\n` +

          `Esta funcionalidad es exclusiva para usuarios con el rol de ${allowedRole}.`

        );

        window.location.replace('/home');

      })();

      return null;

    }

    // ==========================================================
    // 5. ACCESO AUTORIZADO
    // ==========================================================

    return children;

  }

  catch (error) {

    console.error(

      '❌ Error crítico en RoleRoute:',

      error

    );

    return <Navigate
      to="/login"
      replace
    />;

  }

}

export default RoleRoute;