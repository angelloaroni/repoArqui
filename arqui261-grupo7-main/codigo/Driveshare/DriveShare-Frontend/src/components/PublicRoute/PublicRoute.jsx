// src/components/PublicRoute/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

function PublicRoute({ children }) {
  // 🔌 Extraemos tanto 'user' como 'usuario' por retrocompatibilidad adaptativa
  const { user, usuario, loading } = useUser();
  const datosUsuario = user || usuario;

  // ⏳ Si está verificando el localStorage (F5), congelamos un momento de forma fluida
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        <p className="text-lg font-semibold animate-pulse">Cargando...</p>
      </div>
    );
  }

  // 🌟 CONTROL DE FLUJO INTELIGENTE: Si el usuario YA inició sesión...
  if (datosUsuario) {
    
    // 🔥 NUEVA ADUANA: VALIDACIÓN DE ESTADO DE VERIFICACIÓN
    // Si la sesión está activa pero el estado en la BD indica que aún no introduce el código de 6 dígitos,
    // lo mandamos directo a la pantalla de verificación.
    if (datosUsuario.status === 'pending_verification') {
      console.log('PublicRoute: Sesión activa pero cuenta no verificada. Redirigiendo a Verificación...');
      return <Navigate to="/verificar-cuenta" replace />;
    }

    // Evaluamos si su perfil legal está incompleto en la Base de Datos (Postgres / Sequelize)
    const tienePerfilIncompleto = 
      (!datosUsuario.document_id && !datosUsuario.dni) || 
      !datosUsuario.driver_license;

    if (tienePerfilIncompleto) {
      console.log('PublicRoute: Sesión activa pero incompleta. Redirigiendo a Onboarding...');
      return <Navigate to="/usuario/onboarding" replace />;
    }

    // Si su perfil está al día y activo, se le da paso directo a su Dashboard de control
    console.log('PublicRoute: Usuario ya autenticado y validado. Redirigiendo al Dashboard...');
    return <Navigate to="/home" replace />;
  }

  // Si no está autenticado, puede ver las pantallas públicas (Login, Register, Forgot) libremente
  return children;
}

export default PublicRoute;