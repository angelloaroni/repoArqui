// src/components/vehicleDetail/VehicleDetail.jsx

import {
  useParams,
  useNavigate
} from 'react-router-dom'
import { useEffect, useState } from 'react'

import vehicles from '../../data/vehicle'
import users from '../../data/user'
import vehicleImages from '../../data/vehicleImages'
import { checkAvailability } from '../../services/reservationService'
import { getVehicleReviews } from '../../services/reviewService'

import './VehicleDetail.css'

function VehicleDetail() {

  const { vehicleId } =
    useParams()

  const navigate =
    useNavigate()

  const [checkStart, setCheckStart] = useState('')
  const [checkEnd, setCheckEnd] = useState('')
  const [availabilityMsg, setAvailabilityMsg] = useState('')
  const [vehicleReviews, setVehicleReviews] = useState([])

  useEffect(() => {
    let cancelled = false

    const loadReviews = async () => {
      try {
        const response = await getVehicleReviews(vehicleId)
        if (!cancelled) {
          setVehicleReviews(response.data || [])
        }
      } catch {
        if (!cancelled) {
          setVehicleReviews([])
        }
      }
    }

    loadReviews()
    return () => { cancelled = true }
  }, [vehicleId])

  const vehicle =
    vehicles.find(
      vehicle =>
        vehicle.id_vehicle ===
        vehicleId
    )

  if (!vehicle) {

    return (

      <main className="vehicle-detail">

        <h2>
          Vehículo no encontrado
        </h2>

      </main>

    )

  }

  const owner =
    users.find(
      user =>
        user.id_user ===
        vehicle.owner_id
    )

  const getReviewAuthor =
    (userId) => {

      const author =
        users.find(
          user =>
            user.id_user ===
            userId
        )

      return author
        ? `${author.name} ${author.lastname}`
        : 'Usuario'
    }


  const getReviewUser =
  (userId) =>

    users.find(
      user =>
        user.id_user ===
        userId
    )  

  const averageRating =
    vehicleReviews.length > 0
      ? (
        vehicleReviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            review.rating,
          0
        ) /
        vehicleReviews.length
      ).toFixed(1)
      : null

  const vehicleImage =
  vehicleImages.find(
    image =>
      image.vehicle_id ===
      vehicle.id_vehicle
  )

  const handleCheckAvailability = async () => {
    setAvailabilityMsg('')

    if (!checkStart || !checkEnd) {
      setAvailabilityMsg('Elige fechas de inicio y fin.')
      return
    }

    try {
      const result = await checkAvailability(
        vehicle.id_vehicle,
        checkStart,
        checkEnd
      )

      setAvailabilityMsg(
        result.available
          ? 'Disponible en esas fechas.'
          : 'No disponible: ya hay una reserva activa en ese rango.'
      )
    } catch (err) {
      setAvailabilityMsg(
        err.response?.data?.message ||
        'No se pudo consultar la disponibilidad.'
      )
    }
  }
      

  return (

    <main className="vehicle-detail">

      <div className="vehicle-detail-card">

        <div className="vehicle-hero">

        <img
          src={vehicleImage?.image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
        />

        </div>

        <h1>

          {vehicle.brand}
          {' '}
          {vehicle.model}

        </h1>

        <p className="price">

          S/
          {' '}
          {vehicle.price_per_day}
          {' '}
          por día

        </p>

        {
          averageRating && (

            <p className="rating">

              {averageRating}
              {' '}
              ⭐
              {' '}
              (
              {
                vehicleReviews.length
              }
              {' '}
              reseñas
              )

            </p>

          )
        }

        <div className="detail-grid">

          <div>

            <strong>
              Año
            </strong>

            <span>
              {vehicle.year}
            </span>

          </div>

          <div>

            <strong>
              Placa
            </strong>

            <span>
              {vehicle.plate}
            </span>

          </div>

          <div>

            <strong>
              Color
            </strong>

            <span>
              {vehicle.color}
            </span>

          </div>

          <div>

            <strong>
              Tipo
            </strong>

            <span>
              {vehicle.vehicle_type || 'N/D'}
            </span>

          </div>

          <div>

            <strong>
              Transmisión
            </strong>

            <span>
              {vehicle.transmission}
            </span>

          </div>

          <div>

            <strong>
              Combustible
            </strong>

            <span>
              {vehicle.fuel_type}
            </span>

          </div>

          <div>

            <strong>
              Asientos
            </strong>

            <span>
              {vehicle.seats}
            </span>

          </div>

          <div>

            <strong>
              Ubicación
            </strong>

            <span>
              {vehicle.location}
            </span>

          </div>

          <div>

            <strong>
              Propietario
            </strong>

            <span>

              {owner?.name}
              {' '}
              {owner?.lastname}

            </span>

          </div>

          <div>

            <strong>
              Estado
            </strong>

            <span>

              {
                vehicle.is_available
                  ? 'Disponible'
                  : 'No Disponible'
              }

            </span>

          </div>

        </div>

        <div className="description">

          <h3>
            Descripción
          </h3>

          <p>
            {vehicle.description}
          </p>

        </div>

        <div className="description availability-check">
          <h3>Consultar disponibilidad</h3>
          <div className="availability-fields">
            <input
              type="date"
              value={checkStart}
              onChange={(e) => setCheckStart(e.target.value)}
            />
            <input
              type="date"
              value={checkEnd}
              onChange={(e) => setCheckEnd(e.target.value)}
            />
            <button
              type="button"
              className="details-btn"
              onClick={handleCheckAvailability}
            >
              Verificar fechas
            </button>
          </div>
          {availabilityMsg && <p>{availabilityMsg}</p>}
        </div>

        <div className="reviews-section">

          <h3>
            Reseñas
          </h3>

          {
            vehicleReviews.length > 0 ? (

              vehicleReviews.map(
                review => (

                  <div
                    key={
                      review.id_review
                    }
                    className="review-card"
                  >

                  <div className="review-header">

                  <div className="review-user">

                    <div className="review-avatar">

                      <img
                        src={
                          getReviewUser(
                            review.user_id
                          )?.avatar_url
                        }
                        alt={
                          getReviewAuthor(
                            review.user_id
                          )
                        }
                      />

                    </div>

                    <strong>

                      {
                        getReviewAuthor(
                          review.user_id
                        )
                      }

                    </strong>

                  </div>

                  <span>

                    {review.rating}
                    {' '}
                    ⭐

                  </span>

                </div>
                    <p>
                      {review.comment}
                    </p>

                    <small>

                      {
                        new Date(
                          review.created_at
                        ).toLocaleDateString()
                      }

                    </small>

                  </div>

                )
              )

            ) : (

              <p>

                Este vehículo
                aún no tiene reseñas.

              </p>

            )
          }

        </div>

        {
          vehicle.is_available ? (

            <button
              className="reserve-btn"
              onClick={() =>
                navigate(
                  `/vehiculos/${vehicle.id_vehicle}/reservar`
                )
              }
            >
              Reservar Vehículo
            </button>

          ) : (

            <button
              className="
              reserve-btn
              disabled-btn
              "
              disabled
            >
              No Disponible
            </button>

          )
        }

      </div>

    </main>

  )
}

export default VehicleDetail
