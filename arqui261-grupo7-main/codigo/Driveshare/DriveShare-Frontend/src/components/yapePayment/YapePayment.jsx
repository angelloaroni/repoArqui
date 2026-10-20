// src/components/yapePayment/YapePayment.jsx

import { useNavigate } from 'react-router-dom'

import yapeLogo from '../../assets/payment/yape-logo.png'
import qrImage from '../../assets/payment/QR.png'
import { confirmReservation } from '../../services/reservationService'

import './YapePayment.css'

function YapePayment() {

  const navigate =
    useNavigate()

  const reservationData =
    JSON.parse(
      localStorage.getItem(
        'reservationData'
      )
    )

  if (!reservationData) {

    return (

      <main className="yape-payment">

        <h2>
          No existe una reserva
          pendiente de pago.
        </h2>

      </main>

    )
  }

  const handleConfirmPayment = async () => {

    try {
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
        'No se pudo confirmar la reserva tras el pago.'
      )
    }
  }

  return (

    <main className="yape-payment">

      <div className="yape-payment-card">

        <img
          src={yapeLogo}
          alt="Yape"
          className="payment-logo"
        />

        <h1>
          Pago con Yape
        </h1>

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

        <div className="qr-section">

          <img
            src={qrImage}
            alt="QR Pago"
            className="qr-image"
          />

          <p>
            Escanea el código QR
            desde la aplicación
            Yape para completar
            el pago.
          </p>

          <div className="timer">

            Válido por:
            {' '}
            03:00

          </div>

        </div>

        <button
          className="confirm-btn"
          onClick={
            handleConfirmPayment
          }
        >
          Ya realicé el pago
        </button>

      </div>

    </main>

  )
}

export default YapePayment