// src/components/sidebar/Sidebar.jsx

import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import logo from "../../assets/logos/driveshare-logo.png";
import "./Sidebar.css";

function Sidebar({ open, onClose }) {
    if (!open) return null;

    const { user } = useUser();
    const userRole = user?.role?.toLowerCase() || "arrendatario";

    return (
        <div className="sidebar-overlay" onClick={onClose}>
            <aside className="sidebar" onClick={(e) => e.stopPropagation()}>
                
                {/* ================= HEADER ================= */}
                <div className="sidebar-header">
                    <button className="sidebar-close" onClick={onClose}>
                        ✕
                    </button>

                    <div className="sidebar-brand">
                        <img
                            src={logo}
                            alt="DriveShare"
                            className="sidebar-logo"
                        />
                        <h2>DriveShare</h2>
                    </div>

                    {user && (
                        <div className="sidebar-user">
                            <div className="sidebar-avatar">
                                {(user.nombre || user.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <h3>
                                {user.nombre || user.name}{" "}
                                {user.apellido || user.lastname}
                            </h3>
                            <span>
                                {userRole === "arrendador" ? "🚗 Arrendador" : "🔑 Arrendatario"}
                            </span>
                        </div>
                    )}
                </div>

                {/* ================= MENU ================= */}
                <nav className="sidebar-menu">
                    <Link
                        to={userRole === "arrendador" ? "/arrendador/mis-vehiculos" : "/home"}
                        onClick={onClose}
                    >
                        <span>🏠</span> Inicio
                    </Link>

                    <Link to="/vehiculos" onClick={onClose}>
                        <span>🚗</span> Explorar Vehículos
                    </Link>

                    {user && (
                        <Link to="/usuario/perfil" onClick={onClose}>
                            <span>👤</span> Mi Perfil
                        </Link>
                    )}

                    <div className="sidebar-divider"></div>

                    {/* Menú para Arrendatarios */}
                    {userRole === "arrendatario" && (
                        <>
                            <Link to="/usuario/mis-reservas" onClick={onClose}>
                                <span>📅</span> Mis Reservas
                            </Link>
                            <Link to="/usuario/pago" onClick={onClose}>
                                <span>💳</span> Realizar Pago
                            </Link>
                        </>
                    )}

                    {/* Menú para Arrendadores */}
                    {userRole === "arrendador" && (
                        <>
                            <Link to="/arrendador/mis-vehiculos" onClick={onClose}>
                                <span>🚘</span> Mis Vehículos
                            </Link>
                            <Link to="/arrendador/vehiculos/publicar" onClick={onClose}>
                                <span>➕</span> Publicar Vehículo
                            </Link>
                        </>
                    )}

                    <div className="sidebar-divider"></div>

                    <Link to="/usuario/perfil/editar" onClick={onClose}>
                        <span>✏️</span> Editar Perfil
                    </Link>

                    <Link to="/usuario/perfil/cambiar-password" onClick={onClose}>
                        <span>🔒</span> Cambiar Contraseña
                    </Link>
                </nav>

            </aside>
        </div>
    );
}

export default Sidebar;