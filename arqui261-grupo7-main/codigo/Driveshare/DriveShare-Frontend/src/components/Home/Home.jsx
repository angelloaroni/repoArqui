// src/components/Home/Home.jsx
import './Home.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Importaciones de datos locales con contingencia total por si vienen vacíos o corruptos
import vehiclesData from '../../data/vehicle'
import vehicleImagesData from '../../data/vehicleImages'
import { getReviews } from '../../services/reviewService'

// Importación de imágenes fijas del Hero
import heroBackground from '../../assets/images/hero-background-city-night.png'
import heroCar from '../../assets/images/Hero-Car.png'

function Home() {
  const [search, setSearch] = useState('')
  const [reviews, setReviews] = useState([])
  const navigate = useNavigate()

  // Forzamos a que las variables sean arreglos para evitar fallos de lectura (.map / .filter)
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  const vehicleImages = Array.isArray(vehicleImagesData) ? vehicleImagesData : [];

  useEffect(() => {
    let cancelled = false

    const loadReviews = async () => {
      try {
        const response = await getReviews()
        if (!cancelled) {
          setReviews(response.data || [])
        }
      } catch {
        if (!cancelled) {
          setReviews([])
        }
      }
    }

    loadReviews()
    return () => { cancelled = true }
  }, [])

  // Mapear vehículos calculando sus calificaciones de forma ultra segura
  const vehiclesWithRating = vehicles.map(vehicle => {
    if (!vehicle) return null;
    
    const vehicleReviews = reviews.filter(
      review => review && review.vehicle_id === vehicle.id_vehicle
    )

    const averageRating = vehicleReviews.length > 0
      ? (
          vehicleReviews.reduce(
            (sum, review) => sum + (Number(review.rating) || 0),
            0
          ) / vehicleReviews.length
        )
      : 0

    return {
      ...vehicle,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      reviewCount: vehicleReviews.length
    }
  }).filter(Boolean); // Eliminamos elementos nulos si los hubiera

  // Ordenar y obtener los 3 autos principales
  const featuredVehicles = [...vehiclesWithRating]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3)

  return (
    <main className="home">
      {/* SECCIÓN HERO */}
      <section
        className="hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(2, 6, 23, 0.88),
              rgba(2, 6, 23, 0.92)
            ),
            url(${heroBackground})
          `
        }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Comparte autos.
              <br />
              Conduce mejor.
            </h1>

            <p>
              DriveShare conecta propietarios de vehículos
              con personas que necesitan movilidad rápida,
              segura y accesible.
            </p>

            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate('/vehiculos')}
              >
                Explorar Vehículos
              </button>

              <button
                className="btn-secondary"
                onClick={() => navigate('/arrendador/vehiculos/publicar')}
              >
                Publicar Mi Auto
              </button>
            </div>
          </div>

          <div className="hero-image">
            <img
              src={heroCar}
              alt="DriveShare Vehicle"
            />
          </div>

          <div className="hero-search">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar Toyota, Kia, Lima..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="search-btn"
              onClick={() => {
                if (search.trim()) {
                  navigate(`/vehiculos/busqueda/${search}`)
                } else {
                  navigate('/vehiculos')
                }
              }}
            >
              Buscar 🔍
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN VEHÍCULOS DESTACADOS */}
      <section className="featured-section">
        <h2>Vehículos Destacados</h2>

        <div className="vehicle-grid">
          {featuredVehicles.length > 0 ? (
            featuredVehicles.map(vehicle => {
              const vehicleImage = vehicleImages.find(
                image => image && image.vehicle_id === vehicle.id_vehicle
              )

              // Evitamos números negativos o NaN para que .repeat() no rompa la app
              const starCount = Math.max(0, Math.round(vehicle.averageRating || 0));

              return (
                <div
                  key={vehicle.id_vehicle}
                  className="vehicle-card"
                  onClick={() => navigate(`/vehiculos/${vehicle.id_vehicle}`)}
                >
                  <div className="vehicle-image">
                    <img
                      src={vehicleImage?.image_url || 'https://via.placeholder.com/300x200?text=Auto+DriveShare'}
                      alt={`${vehicle.brand || 'Vehículo'} ${vehicle.model || ''}`}
                    />
                  </div>

                  <h3>
                    {vehicle.brand} {vehicle.model}
                  </h3>

                  <div className="vehicle-rating">
                    {'⭐'.repeat(starCount)}
                    <span>
                      {(vehicle.averageRating || 0).toFixed(1)} ({vehicle.reviewCount || 0})
                    </span>
                  </div>

                  <p>{vehicle.location || 'Ubicación no disponible'}</p>

                  <span>
                    S/ {vehicle.price_per_day || '0.00'} / día
                  </span>
                </div>
              )
            })
          ) : (
            <p className="no-vehicles">No hay vehículos disponibles en este momento.</p>
          )}
        </div>
      </section>

      {/* SECCIÓN CÓMO FUNCIONA */}
      <section className="steps-section">
        <h2>¿Cómo funciona?</h2>

        <div className="steps-grid">
          <div className="step-card">
            <span>1</span>
            <h3>Busca</h3>
            <p>Encuentra el vehículo ideal para tu viaje.</p>
          </div>

          <div className="step-card">
            <span>2</span>
            <h3>Reserva</h3>
            <p>Selecciona fechas y confirma tu reserva.</p>
          </div>

          <div className="step-card">
            <span>3</span>
            <h3>Paga</h3>
            <p>Realiza el pago de forma segura.</p>
          </div>

          <div className="step-card">
            <span>4</span>
            <h3>Conduce</h3>
            <p>Disfruta tu experiencia DriveShare.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home;
