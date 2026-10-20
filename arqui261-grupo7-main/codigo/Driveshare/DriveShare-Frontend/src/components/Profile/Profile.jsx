import './Profile.css'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

import reservations from '../../data/reservation'
import reviews from '../../data/review'
import vehicles from '../../data/vehicle'

import HeroBackground from '../../assets/images/hero-background-city-night.png'
import HeroCar from '../../assets/images/Hero-Car.png'

import EmptyReservations from '../../assets/images/empty-reservations.png'
import EmptyReviews from '../../assets/images/empty-reviews.png'
import EmptyVehicles from '../../assets/images/empty-vehicles.png'

import BannerArrendador from '../../assets/images/banner-arrendador.png'

function Profile() {
    const navigate = useNavigate()

    const {
        user,
        usuario,
        updateProfile
    } = useUser()

    const datosUsuario = user || usuario

    const [loadingRole, setLoadingRole] = useState(false)

    if (!datosUsuario) {
        return (
            <main className="profile">
                <div className="profile-empty">
                    <h2>Usuario no encontrado</h2>
                    <p>Inicia sesión para acceder a tu perfil.</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        Ir al Login
                    </button>
                </div>
            </main>
        )
    }

    const currentUserId =
        datosUsuario.id_user ||
        datosUsuario.id

    const userRole =
        datosUsuario.role?.toLowerCase() ||
        "arrendatario"

    const userReservations =
        reservations.filter(
            r => r.id_user === currentUserId
        )

    const recentReviews =
        reviews.filter(
            r => r.id_user === currentUserId
        )

    const myVehicles =
        vehicles.filter(
            v => v.id_user === currentUserId
        )

    const handleConvertirArrendador = async () => {
        setLoadingRole(true)
        try {
            const resultado =
                await updateProfile({
                    role: "arrendador"
                })

            if (resultado.success) {
                alert("🎉 Ahora eres Arrendador.")
            } else {
                alert(resultado.message)
            }
        } catch {
            alert("No fue posible actualizar el rol.")
        } finally {
            setLoadingRole(false)
        }
    }

    return (
        <main className="profile">
            <div className="profile-container">
                {/* =======================================================
                                        HERO
                ======================================================= */}
                <section
                    className="profile-hero"
                    style={{
                        backgroundImage: `linear-gradient(rgba(15,23,42,.78),rgba(15,23,42,.88)),url(${HeroBackground})`
                    }}
                >
                    <div className="profile-hero-content">
                        <div className="hero-avatar">
                            <img
                                src={
                                    datosUsuario.avatar_url ||
                                    datosUsuario.avatar ||
                                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                }
                                alt="avatar"
                            />
                        </div>
                        <div className="hero-info">
                            <h1 className="hero-title">
                                {datosUsuario.nombre} {datosUsuario.apellido}
                            </h1>
                            <p className="hero-subtitle">
                                Bienvenido nuevamente a DriveShare
                            </p>
                            <p className="hero-email">
                                {datosUsuario.email}
                            </p>
                            <div className="hero-badges">
                                <span className="badge-role">
                                    {userRole === "arrendador" ? "🚗 Arrendador" : "🔑 Arrendatario"}
                                </span>
                                <span className="badge-rating">
                                    ⭐ 5.0
                                </span>
                                <span className="badge-success">
                                    🛡 Cuenta Segura
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-car">
                        <img src={HeroCar} alt="car" />
                    </div>
                </section>

                {/* =======================================================
                                    ESTADÍSTICAS
                ======================================================= */}
                <section className="stats-grid">
                    <div
                        className="stat-card"
                        onClick={() =>
                            navigate(
                                userRole === "arrendador"
                                    ? "/arrendador/mis-vehiculos"
                                    : "/vehiculos"
                            )
                        }
                    >
                        <div className="stat-icon">🚗</div>
                        <div>
                            <h2 className="stat-number">
                                {userRole === "arrendador" ? myVehicles.length : 0}
                            </h2>
                            <p className="stat-label">
                                {userRole === "arrendador" ? "Mis Vehículos" : "Vehículos"}
                            </p>
                        </div>
                    </div>

                    <div
                        className="stat-card"
                        onClick={() => navigate("/usuario/mis-reservas")}
                    >
                        <div className="stat-icon">📅</div>
                        <div>
                            <h2 className="stat-number">
                                {userReservations.length}
                            </h2>
                            <p className="stat-label">Reservas</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div>
                            <h2 className="stat-number">
                                {recentReviews.length}
                            </h2>
                            <p className="stat-label">Reseñas</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div>
                            <h2 className="stat-number">5.0</h2>
                            <p className="stat-label">Calificación</p>
                        </div>
                    </div>
                </section>

                {/* =======================================================
                              INFORMACIÓN PERSONAL
                ======================================================= */}
                <section className="profile-card">
                    <div className="section-header">
                        <div>
                            <h2>Información Personal</h2>
                            <p>Información registrada en tu cuenta.</p>
                        </div>
                        <button
                            className="btn-outline"
                            onClick={() => navigate("/usuario/perfil/editar")}
                        >
                            Editar Perfil
                        </button>
                    </div>

                    <div className="info-grid">
                        <div className="info-card">
                            <span className="info-label">Documento</span>
                            <span className="info-value">
                                {datosUsuario.document_id || "No registrado"}
                            </span>
                        </div>

                        <div className="info-card">
                            <span className="info-label">Teléfono</span>
                            <span className="info-value">
                                {datosUsuario.phone || "No registrado"}
                            </span>
                        </div>

                        <div className="info-card">
                            <span className="info-label">Género</span>
                            <span className="info-value">
                                {datosUsuario.gender || "No especificado"}
                            </span>
                        </div>

                        <div className="info-card">
                            <span className="info-label">Nacionalidad</span>
                            <span className="info-value">
                                {datosUsuario.nationality || "No registrada"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* =======================================================
                                    DASHBOARD
                ======================================================= */}
                <div className="dashboard-grid">
                    {/* ================= RESERVAS ================= */}
                    <div className="dashboard-card">
                        <div className="dashboard-header">
                            <h3>📅 Mis Reservas</h3>
                            <p>Historial reciente.</p>
                        </div>

                        {userReservations.length > 0 ? (
                            userReservations.map(res => (
                                <div
                                    key={res.id || res.id_reservation}
                                    className="reservation-item"
                                >
                                    <strong>
                                        Reserva #{res.id || res.id_reservation}
                                    </strong>
                                    <span>
                                        {res.start_date}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="dashboard-empty">
                                <img
                                    src={EmptyReservations}
                                    alt=""
                                />
                                <h4>Aún no tienes reservas</h4>
                                <p>Explora los vehículos disponibles.</p>
                                <button
                                    className="dashboard-btn"
                                    onClick={() => navigate("/vehiculos")}
                                >
                                    Explorar Vehículos
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ================= RESEÑAS ================= */}
                    <div className="dashboard-card">
                        <div className="dashboard-header">
                            <h3>⭐ Reseñas</h3>
                            <p>Opiniones recientes.</p>
                        </div>

                        {recentReviews.length > 0 ? (
                            recentReviews.map(review => (
                                <div
                                    key={review.id}
                                    className="review-item"
                                >
                                    <strong>
                                        {review.rating} ⭐
                                    </strong>
                                    <p>
                                        {review.comment}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="dashboard-empty">
                                <img
                                    src={EmptyReviews}
                                    alt=""
                                />
                                <h4>Sin reseñas</h4>
                                <p>Cuando recibas opiniones aparecerán aquí.</p>
                            </div>
                        )}
                    </div>

                    {/* ================= VEHÍCULOS ================= */}
                    {userRole === "arrendador" && (
                        <div className="dashboard-card">
                            <div className="dashboard-header">
                                <h3>🚗 Mis Vehículos</h3>
                                <p>Vehículos publicados.</p>
                            </div>

                            {myVehicles.length > 0 ? (
                                myVehicles.map(vehicle => (
                                    <div
                                        key={vehicle.id || vehicle.id_vehicle}
                                        className="vehicle-item"
                                    >
                                        <strong>
                                            {vehicle.brand} {vehicle.model}
                                        </strong>
                                        <span>
                                            S/. {vehicle.price_per_day}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="dashboard-empty">
                                    <img
                                        src={EmptyVehicles}
                                        alt=""
                                    />
                                    <h4>Sin vehículos</h4>
                                    <p>Publica tu primer vehículo.</p>
                                    <button
                                        className="dashboard-btn"
                                        onClick={() => navigate("/arrendador/vehiculos/publicar")}
                                    >
                                        Publicar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* =======================================================
                                BANNER ARRENDADOR
                ======================================================= */}
                {userRole === "arrendatario" && (
                    <section className="banner-arrendador">
                        <div className="banner-left">
                            <h2>💰 Convierte tu vehículo en ingresos</h2>
                            <p>
                                Activa gratuitamente el rol de Arrendador y comienza a publicar
                                tus vehículos para que miles de usuarios puedan alquilarlos.
                            </p>
                            <button
                                className="banner-btn"
                                disabled={loadingRole}
                                onClick={handleConvertirArrendador}
                            >
                                {loadingRole ? "Activando..." : "🚀 Convertirme en Arrendador"}
                            </button>
                        </div>
                        <div className="banner-right">
                            <img
                                src={BannerArrendador}
                                alt="Banner Arrendador"
                            />
                        </div>
                    </section>
                )}

                {/* =======================================================
                                    BOTONES
                ======================================================= */}
                <div className="profile-actions">
                    <button
                        className="profile-primary-btn"
                        onClick={() => navigate("/usuario/perfil/editar")}
                    >
                        ✏ Editar Perfil
                    </button>
                    <button
                        className="profile-secondary-btn"
                        onClick={() => navigate("/usuario/perfil/cambiar-password")}
                    >
                        🔒 Cambiar Contraseña
                    </button>
                </div>
            </div>
        </main>
    )
}

export default Profile