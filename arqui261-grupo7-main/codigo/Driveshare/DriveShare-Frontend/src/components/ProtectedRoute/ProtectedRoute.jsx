// src/components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; 

function ProtectedRoute({ children }) {
  // Extraemos las utilidades de sesión del contexto global centralizado
  const { user, usuario, loading, logout } = useUser();
  
  // Normalizamos el usuario para tolerar cualquier nomenclatura expuesta en el Context
  const datosUsuario = user || usuario;

  // ⏳ Evita el bug del "F5" congelando la pantalla mientras se lee el token
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        <p className="text-lg font-semibold animate-pulse">Cargando sesión segura...</p>
      </div>
    );
  }

  try {
    // 1. Si el usuario no está autenticado, se le expulsa al login
    if (!datosUsuario) {
      console.log('ProtectedRoute: Usuario no autenticado');
      return <Navigate to="/login" replace />;
    }

    // Identificamos que tenga una clave primaria válida mapeada con el Backend (Postgres)
    const idValido = datosUsuario.id_user || datosUsuario.id;

    if (!idValido) {
      console.log('ProtectedRoute: Estructura de usuario inválida (Falta ID)');
      logout();
      return <Navigate to="/login" replace />;
    }

    // 🔥 NUEVA ADUANA: VALIDACIÓN DE ESTADO DE VERIFICACIÓN
    // Si la cuenta está en verificación pendiente, lo obligamos a ir a ingresar su código de 6 dígitos.
    if (datosUsuario.status === 'pending_verification') {
      console.log('ProtectedRoute: Cuenta no verificada. Redirigiendo a verificación...');
      return <Navigate to="/verificar-cuenta" replace />;
    }

    // 🌟 2. LA ADUANA CENTRALIZADA DE PERFIL LEGAL (BLINDADA CONTRA MULTIIDIOMA)
    // Extraemos los campos usando fallbacks tolerantes para capturar el valor real de la BD o del Context
    const dniExistente = datosUsuario.document_id || datosUsuario.dni;
    const licenciaExistente = datosUsuario.driver_license || datosUsuario.licencia || datosUsuario.driverLicense;
    const telefonoExistente = datosUsuario.phone || datosUsuario.telefono;

    // El perfil realmente está incompleto SÓLO si falta al menos uno de estos tres datos esenciales
    const tienePerfilIncompleto = !dniExistente || !licenciaExistente || !telefonoExistente;
      
    const yaEstaEnOnboarding = window.location.pathname === '/usuario/onboarding';

    if (tienePerfilIncompleto && !yaEstaEnOnboarding) {
      console.log('ProtectedRoute: Perfil legal incompleto. Redirigiendo a Onboarding...', {
        dniExistente,
        licenciaExistente,
        telefonoExistente
      });
      return <Navigate to="/usuario/onboarding" replace />;
    }

    // Evitamos bucles si el usuario ya está completo
    if (!tienePerfilIncompleto && yaEstaEnOnboarding) {
      console.log('ProtectedRoute: El perfil ya está activo. Redirigiendo al Dashboard...');
      return <Navigate to="/home" replace />;
    }

    // 3. Si superó todos los filtros, acceso seguro
    return children;

  } catch (error) {
    console.error("❌ Error crítico en ProtectedRoute:", error);
    logout();
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;