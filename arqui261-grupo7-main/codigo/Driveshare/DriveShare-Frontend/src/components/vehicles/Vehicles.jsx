// src/components/vehicles/Vehicles.jsx

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import vehicles from '../../data/vehicle'
import vehicleImages from '../../data/vehicleImages'
import reviews from '../../data/review'
import { getUnavailableVehicles } from '../../services/reservationService'

import './Vehicles.css'

const VEHICLE_TYPES = ['Sedán', 'SUV', 'Hatchback']

function Vehicles() {

  const { search = '' } = useParams()

  const [text, setText] = useState(search || '')
  const [location, setLocation] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(true)
  const [unavailableIds, setUnavailableIds] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')

  useEffect(() => {
    setText(search || '')
  }, [search])

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
            'No se pudo consultar disponibilidad por fechas.'
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

      const blockedByDates =
        Boolean(startDate && endDate) &&
        unavailableIds.includes(String(vehicle.id_vehicle))

      const isAvailableNow =
        vehicle.is_available !== false && !blockedByDates

      if (onlyAvailable && !isAvailableNow) {
        return false
      }

      return matchesText && matchesLocation && matchesType
    })
  }, [
    text,
    location,
    vehicleType,
    startDate,
    endDate,
    unavailableIds,
    onlyAvailable
  ])

  return (
    <main className="vehicles-page">
      <h1>Vehículos</h1>

      <div className="vehicles-filters">
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

        <div className="filter-group filter-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Solo disponibles
          </label>
        </div>
      </div>

      {loadingAvailability && (
        <p className="vehicles-meta">Consultando disponibilidad por fechas...</p>
      )}

      {availabilityError && (
        <p className="vehicles-error">{availabilityError}</p>
      )}

      <p className="vehicles-meta">
        {results.length} vehículo(s)
        {onlyAvailable ? ' disponibles' : ''}
        {startDate && endDate ? ` entre ${startDate} y ${endDate}` : ''}
      </p>

      {results.length > 0 ? (
        <div className="vehicles-grid">
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

            const blockedByDates =
              Boolean(startDate && endDate) &&
              unavailableIds.includes(String(vehicle.id_vehicle))

            const isAvailable =
              vehicle.is_available !== false && !blockedByDates

            return (
              <div key={vehicle.id_vehicle} className="vehicle-card">
                <div className="vehicle-image">
                  <img
                    src={vehicleImage?.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                  />
                </div>

                <h3>
                  {vehicle.brand} {vehicle.model}
                </h3>

                {vehicle.vehicle_type && (
                  <p className="vehicle-type">{vehicle.vehicle_type}</p>
                )}

                <div className="vehicle-rating">
                  {'⭐'.repeat(Math.round(averageRating) || 0)}
                  <span>
                    {averageRating.toFixed(1)} ({vehicleReviews.length})
                  </span>
                </div>

                <p>{vehicle.location}</p>
                <p>{vehicle.year}</p>

                <p className={isAvailable ? 'available' : 'unavailable'}>
                  {isAvailable ? '🟢 Disponible' : '🔴 No Disponible'}
                </p>

                <span>
                  S/ {vehicle.price_per_day} por día
                </span>

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
        <div className="vehicles-empty">
          <h2>No se encontraron vehículos</h2>
          <p>Prueba quitando filtros o cambiando las fechas.</p>
        </div>
      )}
    </main>
  )
}

export default Vehicles
