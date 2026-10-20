// src/components/myReservations/MyReservations.jsx

import { useEffect, useState } from 'react'
import './MyReservations.css'

import ReviewForm from '../reviewForm/ReviewForm'
import {
  getUserReservations,
  cancelReservation,
  updateReservation,
  closeReservation
} from '../../services/reservationService'
import {
  getUserReviews,
  createReview,
  updateReview,
  deleteReview
} from '../../services/reviewService'

function statusClass(status) {
  if (status === 'Confirmada') return 'confirmed'
  if (status === 'Pendiente') return 'pending'
  if (status === 'Finalizada') return 'finished'
  if (status === 'Rechazada') return 'rejected'
  return 'cancelled'
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : ''
}

function MyReservations() {
  const [myReservations, setMyReservations] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    start_date: '',
    end_date: '',
    pickup_location: '',
    return_location: ''
  })

  const [reviewModal, setReviewModal] = useState({
    open: false,
    reservationId: null,
    review: null
  })

  const loadReviews = async () => {
    const response = await getUserReviews()
    setReviews(response.data || [])
  }

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError('')

      const [reservationResponse, reviewResponse] = await Promise.all([
        getUserReservations(),
        getUserReviews()
      ])

      setMyReservations(reservationResponse.data || [])
      setReviews(reviewResponse.data || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron cargar tus reservas.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const findReview = (reservationId) =>
    reviews.find(
      (review) => String(review.reservation_id) === String(reservationId)
    )

  const openCreateReview = (reservationId) => {
    setReviewModal({
      open: true,
      reservationId,
      review: null
    })
  }

  const openEditReview = (reservationId) => {
    setReviewModal({
      open: true,
      reservationId,
      review: findReview(reservationId) || null
    })
  }

  const closeReviewModal = () => {
    setReviewModal({
      open: false,
      reservationId: null,
      review: null
    })
  }

  const handleSaveReview = async ({ rating, comment }) => {
    const reservationId = reviewModal.reservationId
    const existing = findReview(reservationId)

    try {
      if (existing) {
        await updateReview(existing.id_review, { rating, comment })
      } else {
        await createReview({
          reservation_id: reservationId,
          rating,
          comment
        })
      }

      await loadReviews()
      closeReviewModal()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo guardar la reseña.')
    }
  }

  const handleDeleteReview = async (reservationId) => {
    const ok = window.confirm('¿Eliminar esta reseña?')
    if (!ok) return

    const review = findReview(reservationId)
    if (!review) return

    try {
      await deleteReview(review.id_review)
      await loadReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar la reseña.')
    }
  }

  const handleCancel = async (id) => {
    const ok = window.confirm('¿Cancelar esta reserva?')
    if (!ok) return

    try {
      await cancelReservation(id)
      await loadReservations()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo cancelar.')
    }
  }

  const handleClose = async (id) => {
    const ok = window.confirm(
      '¿Registrar devolución y finalizar la reserva?'
    )
    if (!ok) return

    try {
      await closeReservation(id)
      await loadReservations()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo finalizar.')
    }
  }

  const startEdit = (reservation) => {
    setEditingId(reservation.id_reservation)
    setEditForm({
      start_date: formatDate(reservation.start_date),
      end_date: formatDate(reservation.end_date),
      pickup_location: reservation.pickup_location,
      return_location: reservation.return_location
    })
  }

  const handleUpdate = async (id) => {
    try {
      await updateReservation(id, editForm)
      setEditingId(null)
      await loadReservations()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo modificar.')
    }
  }

  if (loading) {
    return (
      <main className="my-reservations">
        <h1>Mis Reservas</h1>
        <p>Cargando...</p>
      </main>
    )
  }

  return (
    <main className="my-reservations">
      <h1>Mis Reservas</h1>

      {error && <p className="reservation-error">{error}</p>}

      {myReservations.length === 0 && !error && (
        <p>No tienes reservas registradas.</p>
      )}

      <div className="reservations-grid">
        {myReservations.map((reservation) => {
          const review = findReview(reservation.id_reservation)

          return (
            <div
              key={reservation.id_reservation}
              className="reservation-card"
            >
              <h3>
                {reservation.vehicle_name || reservation.vehicle_id}
              </h3>

              <p>Reserva: #{reservation.id_reservation}</p>
              <p>Inicio: {formatDate(reservation.start_date)}</p>
              <p>Fin: {formatDate(reservation.end_date)}</p>
              <p>Total: S/ {reservation.total_price}</p>
              <p>
                Recojo: {reservation.pickup_location} →{' '}
                {reservation.return_location}
              </p>

              <span className={statusClass(reservation.status)}>
                {reservation.status}
              </span>

              <div className="reservation-actions">
                {(reservation.status === 'Pendiente' ||
                  reservation.status === 'Confirmada') &&
                  new Date(reservation.start_date) > new Date() && (
                    <button
                      className="edit-reservation-btn"
                      onClick={() => startEdit(reservation)}
                    >
                      Modificar
                    </button>
                  )}

                {(reservation.status === 'Pendiente' ||
                  reservation.status === 'Confirmada') && (
                  <button
                    className="cancel-reservation-btn"
                    onClick={() =>
                      handleCancel(reservation.id_reservation)
                    }
                  >
                    Cancelar
                  </button>
                )}

                {reservation.status === 'Confirmada' && (
                  <button
                    className="close-reservation-btn"
                    onClick={() =>
                      handleClose(reservation.id_reservation)
                    }
                  >
                    Registrar devolución
                  </button>
                )}
              </div>

              {editingId === reservation.id_reservation && (
                <div className="edit-reservation-form">
                  <label>Inicio</label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        start_date: e.target.value
                      })
                    }
                  />
                  <label>Fin</label>
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        end_date: e.target.value
                      })
                    }
                  />
                  <label>Recojo</label>
                  <input
                    type="text"
                    value={editForm.pickup_location}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        pickup_location: e.target.value
                      })
                    }
                  />
                  <label>Devolución</label>
                  <input
                    type="text"
                    value={editForm.return_location}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        return_location: e.target.value
                      })
                    }
                  />
                  <div className="reservation-actions">
                    <button
                      className="edit-reservation-btn"
                      onClick={() =>
                        handleUpdate(reservation.id_reservation)
                      }
                    >
                      Guardar
                    </button>
                    <button
                      className="cancel-reservation-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}

              {reservation.status === 'Confirmada' && (
                <p className="review-hint">
                  Para dejar una reseña, primero registra la
                  devolución (finaliza la reserva).
                </p>
              )}

              {reservation.status === 'Finalizada' && (
                <div className="review-section">
                  <h4>Reseña</h4>

                  {!review ? (
                    <button
                      className="review-btn"
                      onClick={() =>
                        openCreateReview(reservation.id_reservation)
                      }
                    >
                      Dejar reseña
                    </button>
                  ) : (
                    <>
                      <div className="review-card">
                        <div className="review-rating">
                          {review.rating} ⭐
                        </div>
                        <p>{review.comment}</p>
                        <small>
                          {formatDate(review.updated_at || review.created_at)}
                        </small>
                      </div>

                      <div className="review-actions">
                        <button
                          className="edit-review-btn"
                          onClick={() =>
                            openEditReview(reservation.id_reservation)
                          }
                        >
                          Editar reseña
                        </button>
                        <button
                          className="delete-review-btn"
                          onClick={() =>
                            handleDeleteReview(
                              reservation.id_reservation
                            )
                          }
                        >
                          Eliminar reseña
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {reviewModal.open && (
        <ReviewForm
          review={reviewModal.review}
          onSave={handleSaveReview}
          onCancel={closeReviewModal}
        />
      )}
    </main>
  )
}

export default MyReservations
