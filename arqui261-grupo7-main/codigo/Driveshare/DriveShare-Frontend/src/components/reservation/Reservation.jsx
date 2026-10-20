// src/components/reservation/Reservation.jsx

import { useState } from 'react'
import {
  useNavigate,
  useParams
} from 'react-router-dom'

import vehicles from '../../data/vehicle'
import {
  createReservation,
  checkAvailability
} from '../../services/reservationService'

import './Reservation.css'

function Reservation() {

  const navigate = useNavigate()
  const { vehicleId } = useParams()

  const vehicle = vehicles.find(
    (v) => v.id_vehicle === vehicleId
  )

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [returnLocation, setReturnLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!vehicle) {
    return <h2>Vehículo no encontrado</h2>
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const days = calculateDays()
  const total =
    days > 0 ? days * vehicle.price_per_day : 0

  const handleReservation = async () => {
    setError('')

    if (!startDate || !endDate || !pickupLocation || !returnLocation) {
      setError('Completa todos los campos')
      return
    }

    if (days <= 0) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      return
    }

    try {
      setLoading(true)

      // RF23 — validar disponibilidad antes de crear
      const availability = await checkAvailability(
        vehicle.id_vehicle,
        startDate,
        endDate
      )

      if (!availability.available) {
        setError(
          'El vehículo no está disponible en esas fechas (ya tiene una reserva activa).'
        )
        return
      }

      const response = await createReservation({
        vehicle_id: vehicle.id_vehicle,
        owner_id: vehicle.owner_id,
        vehicle_name: `${vehicle.brand} ${vehicle.model}`,
        price_per_day: vehicle.price_per_day,
        start_date: startDate,
        end_date: endDate,
        pickup_location: pickupLocation,
        return_location: returnLocation
      })

      const reservation = response.data

      localStorage.setItem(
        'reservationData',
        JSON.stringify({
          id_reservation: reservation.id_reservation,
          vehicle_id: vehicle.id_vehicle,
          vehicle_name: `${vehicle.brand} ${vehicle.model}`,
          start_date: startDate,
          end_date: endDate,
          pickup_location: pickupLocation,
          return_location: returnLocation,
          days,
          total: reservation.total_price
        })
      )

      navigate('/usuario/pago')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo crear la reserva. Verifica tu sesión e intenta de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="reservation">
      <div className="reservation-card">
        <h1>Reservar Vehículo</h1>

        <div className="vehicle-summary">
          <h3>
            {vehicle.brand} {vehicle.model}
          </h3>
          <p>
            Precio: S/ {vehicle.price_per_day} por día
          </p>
          <p>Ubicación: {vehicle.location}</p>
        </div>

        <div className="reservation-form">
          <div className="form-group">
            <label>Fecha de inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Fecha de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Lugar de recojo</label>
            <input
              type="text"
              placeholder="Ej. Miraflores"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Lugar de devolución</label>
            <input
              type="text"
              placeholder="Ej. San Isidro"
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
            />
          </div>

          <div className="reservation-total">
            <p>Días: {days}</p>
            <p>Total: S/ {total}</p>
          </div>

          {error && (
            <p className="reservation-error">{error}</p>
          )}

          <button
            className="reservation-btn"
            onClick={handleReservation}
            disabled={loading}
          >
            {loading ? 'Creando reserva...' : 'Continuar al Pago'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default Reservation
