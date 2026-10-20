// src/components/cardPayment/CardPayment.jsx

import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import tarjetaImage from '../../assets/payment/tarjeta.webp'
import visaLogo from '../../assets/payment/visa-logo.png'
import mastercardLogo from '../../assets/payment/mastercard-logo.png'
import { confirmReservation } from '../../services/reservationService'

import './CardPayment.css'

function CardPayment() {

  const navigate =
    useNavigate()

  const [cardNumber,
    setCardNumber] =
    useState('')

  const [cardHolder,
    setCardHolder] =
    useState('')

  const [expiryDate,
    setExpiryDate] =
    useState('')

  const [cvv,
    setCvv] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const reservationData =
    JSON.parse(
      localStorage.getItem(
        'reservationData'
      )
    )

  if (!reservationData) {

    return (

      <main className="card-payment">

        <h2>
          No existe una reserva
          pendiente de pago.
        </h2>

      </main>

    )
  }

  const handlePayment = async () => {

    if (
      !cardNumber ||
      !cardHolder ||
      !expiryDate ||
      !cvv
    ) {

      alert(
        'Completa todos los campos'
      )

      return
    }

    try {
      setLoading(true)

      if (reservationData.id_reservation) {
        await confirmReservation(
          reservationData.id_reservation
        )
      }

      localStorage.removeItem('reservationData')

      alert(
        'Pago realizado correctamente. Reserva confirmada.'
      )

      navigate(
        '/usuario/mis-reservas'
      )
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'El pago se registró, pero no se pudo confirmar la reserva.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (

    <main className="card-payment">

      <div className="card-payment-card">

        <h1>
          Pago con Tarjeta
        </h1>

        <img
          src={tarjetaImage}
          alt="Tarjeta"
          className="card-preview"
        />

        <div className="card-brands">

          <img
            src={visaLogo}
            alt="Visa"
          />

          <img
            src={mastercardLogo}
            alt="Mastercard"
          />

        </div>

        <div className="payment-summary">

          <h3>
            Resumen de Reserva
          </h3>

          <p>
            Vehículo:
            {' '}
            {
              reservationData.vehicle_name
            }
          </p>

          <p>
            Fecha inicio:
            {' '}
            {
              reservationData.start_date
            }
          </p>

          <p>
            Fecha fin:
            {' '}
            {
              reservationData.end_date
            }
          </p>

          <p>
            Lugar de recojo:
            {' '}
            {
              reservationData.pickup_location
            }
          </p>

          <p>
            Lugar de devolución:
            {' '}
            {
              reservationData.return_location
            }
          </p>

          <p>
            Días:
            {' '}
            {
              reservationData.days
            }
          </p>

          <p>
            Total:
            {' '}
            S/
            {' '}
            {
              reservationData.total
            }
          </p>

        </div>

        <div className="card-form">

          <input
            type="text"
            placeholder="
            Número de tarjeta
            "
            value={
              cardNumber
            }
            onChange={(e) =>
              setCardNumber(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="
            Nombre del titular
            "
            value={
              cardHolder
            }
            onChange={(e) =>
              setCardHolder(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="MM/AA"
            value={
              expiryDate
            }
            onChange={(e) =>
              setExpiryDate(
                e.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="CVV"
            value={cvv}
            onChange={(e) =>
              setCvv(
                e.target.value
              )
            }
          />

        </div>

        <button
          className="pay-btn"
          onClick={
            handlePayment
          }
        >
          Confirmar Pago
        </button>

      </div>

    </main>

  )
}

export default CardPayment