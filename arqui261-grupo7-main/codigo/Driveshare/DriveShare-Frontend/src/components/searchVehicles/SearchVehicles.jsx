// src/components/searchVehicles/SearchVehicles.jsx

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import vehicles from '../../data/vehicle'
import vehicleImages from '../../data/vehicleImages'
import { getUnavailableVehicles } from '../../services/reservationService'
import { getReviews } from '../../services/reviewService'

import './SearchVehicles.css'

const VEHICLE_TYPES = ['Sedán', 'SUV', 'Hatchback']

function SearchVehicles() {

  const { search = '' } = useParams()

  const [text, setText] = useState(search || '')
  const [location, setLocation] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [unavailableIds, setUnavailableIds] = useState([])
  const [reviews, setReviews] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')

  useEffect(() => {
    setText(search || '')
  }, [search])

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

  useEffect(() => {
    let cancelled = false

    const loadAvailability = async () => {
      setAvailabilityError('')

      if (!startDate || !endDate) {
        setUnavailableIds([])
        return
      }

      if (new Date(endDate) <= new Date(startDate)) {
        setUnavailableIds([])
        setAvailabilityError('La fecha de fin debe ser posterior a la de inicio.')
        return
      }

      try {
        setLoadingAvailability(true)
        const response = await getUnavailableVehicles(startDate, endDate)
        if (!cancelled) {
          setUnavailableIds(response.data || [])
        }
      } catch (err) {
        if (!cancelled) {
          setUnavailableIds([])
          setAvailabilityError(
            err.response?.data?.message ||
            'No se pudo consultar disponibilidad.'
          )
        }
      } finally {
        if (!cancelled) setLoadingAvailability(false)
      }
    }

    loadAvailability()
    return () => { cancelled = true }
  }, [startDate, endDate])

  const results = useMemo(() => {
    const term = text.trim().toLowerCase()
    const locationTerm = location.trim().toLowerCase()

    return vehicles.filter((vehicle) => {
      const matchesText =
        !term ||
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.location.toLowerCase().includes(term) ||
        String(vehicle.vehicle_type || '').toLowerCase().includes(term)

      const matchesLocation =
        !locationTerm ||
        vehicle.location.toLowerCase().includes(locationTerm)

      const matchesType =
        !vehicleType ||
        vehicle.vehicle_type === vehicleType

      const matchesFlag = vehicle.is_available !== false

      const blockedByDates =
        startDate &&
        endDate &&
        unavailableIds.includes(String(vehicle.id_vehicle))

      return matchesText && matchesLocation && matchesType && matchesFlag && !blockedByDates
    })
  }, [text, location, vehicleType, startDate, endDate, unavailableIds])

  return (
    <main className="search-page">
      <h1>Búsqueda de vehículos disponibles</h1>
      <p className="search-count">
        Filtra por fechas, ubicación y tipo (RF18).
      </p>

      <div className="search-filters">
        <div className="filter-group">
          <label>Texto / marca / modelo</label>
          <input
            type="text"
            value={text}
            placeholder="Ej. Toyota, Miraflores..."
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Ubicación</label>
          <input
            type="text"
            value={location}
            placeholder="Ej. Surco"
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Tipo de auto</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="">Todos</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {loadingAvailability && (
        <p className="search-count">Consultando disponibilidad...</p>
      )}

      {availabilityError && (
        <p className="search-error">{availabilityError}</p>
      )}

      <p className="search-count">
        {results.length} vehículo(s) disponible(s)
        {startDate && endDate ? ` entre ${startDate} y ${endDate}` : ''}
      </p>

      {results.length > 0 ? (
        <div className="search-grid">
          {results.map((vehicle) => {
            const vehicleImage = vehicleImages.find(
              (image) => image.vehicle_id === vehicle.id_vehicle
            )

            const vehicleReviews = reviews.filter(
              (review) => review.vehicle_id === vehicle.id_vehicle
            )

            const averageRating =
              vehicleReviews.length > 0
                ? vehicleReviews.reduce((sum, review) => sum + review.rating, 0) /
                  vehicleReviews.length
                : 0

            return (
              <div key={vehicle.id_vehicle} className="search-card">
                <div className="search-image">
                  <img
                    src={vehicleImage?.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                  />
                </div>

                <h3>
                  {vehicle.brand} {vehicle.model}
                </h3>

                <p className="search-type">{vehicle.vehicle_type}</p>

                {vehicleReviews.length > 0 ? (
                  <div className="search-rating">
                    {'⭐'.repeat(Math.round(averageRating))}
                    <span>
                      {averageRating.toFixed(1)} ({vehicleReviews.length})
                    </span>
                  </div>
                ) : (
                  <div className="no-rating">Sin reseñas</div>
                )}

                <p>{vehicle.location}</p>
                <p>{vehicle.year}</p>

                <div className="available">Disponible</div>

                <div className="search-price">
                  S/ {vehicle.price_per_day} por día
                </div>

                <Link
                  to={`/vehiculos/${vehicle.id_vehicle}`}
                  className="details-btn"
                >
                  Ver Detalles
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-search">
          <h2>No se encontraron vehículos</h2>
          <p>
            Prueba otras fechas, otra ubicación o otro tipo de auto.
          </p>
        </div>
      )}
    </main>
  )
}

export default SearchVehicles
