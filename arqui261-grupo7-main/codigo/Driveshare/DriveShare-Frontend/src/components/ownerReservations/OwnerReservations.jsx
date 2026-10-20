// src/components/ownerReservations/OwnerReservations.jsx

import { useEffect, useState } from 'react'
import '../myReservations/MyReservations.css'
import {
  getOwnerReservations,
  acceptReservation,
  rejectReservation,
  closeReservation
} from '../../services/reservationService'

function statusClass(status) {
  if (status === 'Confirmada') return 'confirmed'
  if (status === 'Pendiente') return 'pending'
  if (status === 'Finalizada') return 'finished'
  if (status === 'Rechazada') return 'rejected'
  return 'cancelled'
}

function OwnerReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getOwnerReservations()
      setReservations(response.data || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron cargar las reservas de tus vehículos.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAccept = async (id) => {
    try {
      await acceptReservation(id)
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo aceptar.')
    }
  }

  const handleReject = async (id) => {
    const ok = window.confirm('¿Rechazar esta solicitud de reserva?')
    if (!ok) return
    try {
      await rejectReservation(id)
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo rechazar.')
    }
  }

  const handleClose = async (id) => {
    const ok = window.confirm('¿Finalizar esta reserva (devolución)?')
    if (!ok) return
    try {
      await closeReservation(id)
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo finalizar.')
    }
  }

  if (loading) {
    return (
      <main className="my-reservations">
        <h1>Reservas de mis vehículos</h1>
        <p>Cargando...</p>
      </main>
    )
  }

  return (
    <main className="my-reservations">
      <h1>Reservas de mis vehículos</h1>

      {error && <p className="reservation-error">{error}</p>}

      {reservations.length === 0 && !error && (
        <p>No hay reservas asociadas a tus vehículos.</p>
      )}

      <div className="reservations-grid">
        {reservations.map((reservation) => (
          <div
            key={reservation.id_reservation}
            className="reservation-card"
          >
            <h3>
              {reservation.vehicle_name || reservation.vehicle_id}
            </h3>
            <p>Reserva: #{reservation.id_reservation}</p>
            <p>Arrendatario (user_id): {reservation.user_id}</p>
            <p>
              Inicio: {String(reservation.start_date).slice(0, 10)}
            </p>
            <p>Fin: {String(reservation.end_date).slice(0, 10)}</p>
            <p>Total: S/ {reservation.total_price}</p>

            <span className={statusClass(reservation.status)}>
              {reservation.status}
            </span>

            <div className="reservation-actions">
              {reservation.status === 'Pendiente' && (
                <>
                  <button
                    className="edit-reservation-btn"
                    onClick={() =>
                      handleAccept(reservation.id_reservation)
                    }
                  >
                    Aceptar
                  </button>
                  <button
                    className="cancel-reservation-btn"
                    onClick={() =>
                      handleReject(reservation.id_reservation)
                    }
                  >
                    Rechazar
                  </button>
                </>
              )}

              {reservation.status === 'Confirmada' && (
                <button
                  className="close-reservation-btn"
                  onClick={() =>
                    handleClose(reservation.id_reservation)
                  }
                >
                  Cerrar alquiler
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OwnerReservations
