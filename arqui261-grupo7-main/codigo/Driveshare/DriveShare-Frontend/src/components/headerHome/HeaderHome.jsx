// src/components/headerHome/HeaderHome.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; // Usamos tu contexto unificado real
import logo from '../../assets/logos/driveshare-logo.png';
import './HeaderHome.css';

function HeaderHome() {
  const navigate = useNavigate();
  // 🔌 Conexión unificada con el estado global de tu UserContext
  const { user, logout } = useUser(); 

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Imagen por defecto en caso de que el usuario no tenga una foto de perfil asignada
  const avatarPorDefecto = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  return (
    <header className="header-home">
      <div className="header-logo">
        <Link to="/">
          <img
            src={logo}
            alt="DriveShare"
            className="logo-image"
          />
        </Link>
      </div>

      <div className="header-user">
        {user ? (
          <>
            {/* Contenedor del Avatar del Usuario */}
            <div className="user-avatar-container">
              <img 
                src={user.avatar_url|| user.avatar || user.imagen || user.image_url || avatarPorDefecto} 
                alt={user.nombre || "Usuario"} 
                className="user-avatar-img"
                onClick={() => navigate('/usuario/perfil')}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div className="user-info">
              <span className="user-name">
                {user.nombre || user.name || "Usuario"}
              </span>

              <span className="user-role">
                {user.role || 'Cliente'}
              </span>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn-login"
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/register"
              className="btn-register"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default HeaderHome;