// src/components/navbar/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
// 🚀 Consumimos el estado global real de DriveShare
import { useUser } from '../../context/UserContext'; 
import './NavBar.css'; // Mantenemos tu hoja de estilos intacta

function Navbar() {
  const navigate = useNavigate();
  
  // 🛡️ Extraemos al usuario logueado y la función de cierre de sesión
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout(); // Limpia los tokens y el estado reactivo
    navigate('/login');
  };

  // Convertimos el rol a minúsculas de forma segura para evitar fallos de mayúsculas en la BD
  const userRole = user?.role?.toLowerCase() || 'arrendatario';

  return (
    <>
      <nav className="navbar">
        {/* Botón para abrir el menú lateral (Sidebar) */}
        <button
          className="menu-button"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <div className="navbar-links">
          {/* Si el usuario es Arrendador o Admin lo mandamos a su panel, si no, al catálogo general */}
          <Link to={(user?.admin || userRole === 'arrendador') ? "/arrendador/mis-vehiculos" : "/home"}>
            Inicio
          </Link>

          <Link to="/vehiculos">
            Vehículos
          </Link>

          {user && (
            <>
              {/* Evaluamos de forma segura el rol dinámico inyectado por tu backend */}
              {(user.admin || userRole === 'arrendador') ? (
                <>
                  <Link to="/arrendador/mis-vehiculos">Mis Autos</Link>
                  <Link to="/arrendador/reservas">Reservas recibidas</Link>
                </>
              ) : (
                // Si es un Arrendatario (cliente común), ve sus alquileres y perfil
                <Link to="/usuario/mis-reservas">Mis Reservas</Link>
              )}
              {/* Ambos roles pueden ver el historial de reservas propias como arrendatario */}
              {(user.admin || userRole === 'arrendador') && (
                <Link to="/usuario/mis-reservas">Mis Reservas</Link>
              )}
              <Link to="/usuario/perfil">
                Mi Perfil
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              {/* Mostramos el nombre dinámico inyectado por tu base de datos o el perfil de Google */}
              <span className="user-name-display">
                👋 Hola, {user.nombre || user.name || 'Usuario'}
              </span>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Salir
              </button>
            </>
          ) : (
            // 🚪 Si no hay una sesión activa, mostramos el botón clásico de entrada
            <Link to="/login" className="login-nav-btn">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>

      {/* Le pasamos el estado al Sidebar para mantener sincronizada la apertura */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}

export default Navbar;