//src\components\payment\Payment.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import yapeLogo from '../../assets/payment/yape-logo.png'
import plinLogo from '../../assets/payment/plin-logo.png'
import pagoQr from '../../assets/payment/pago-qr.png'
import pagoTarjeta from '../../assets/payment/pago-tarjeta.png'

import './Payment.css'

function Payment() {

  const navigate =
    useNavigate()

  const [method, setMethod] =
    useState('')

  const reservationData =
    JSON.parse(
      localStorage.getItem(
        'reservationData'
      )
    )

  if (!reservationData) {

    return (

      <main className="payment">

        <h2>
          No existe una reserva
          pendiente de pago.
        </h2>

      </main>

    )
  }

  const handleContinue = () => {

    if (!method) {

      alert(
        'Selecciona un método de pago'
      )

      return
    }

    if (method === 'card') {
      navigate(
        '/usuario/pago/tarjeta'
      )
    }

    if (method === 'yape') {
      navigate(
        '/usuario/pago/yape'
      )
    }

    if (method === 'plin') {
      navigate(
        '/usuario/pago/plin'
      )
    }
  }

  return (

    <main className="payment">

      <div className="payment-card">

        <h1>
          Método de Pago
        </h1>

        <div className="reservation-summary">

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

        <label className="payment-option">

          <input
            type="radio"
            name="payment"
            value="card"
            onChange={(e) =>
              setMethod(
                e.target.value
              )
            }
          />

          <div className="payment-method">

            <img
              src={pagoTarjeta}
              alt="Pago con tarjeta"
              className="payment-image"
            />

            <span>
              Tarjeta
            </span>

          </div>

        </label>

        <label className="payment-option">

          <input
            type="radio"
            name="payment"
            value="yape"
            onChange={(e) =>
              setMethod(
                e.target.value
              )
            }
          />

          <div className="payment-method">

            <img
              src={yapeLogo}
              alt="Yape"
              className="payment-logo"
            />

            <img
              src={pagoQr}
              alt="Pago QR"
              className="payment-image"
            />

          </div>

        </label>

        <label className="payment-option">

          <input
            type="radio"
            name="payment"
            value="plin"
            onChange={(e) =>
              setMethod(
                e.target.value
              )
            }
          />

          <div className="payment-method">

            <img
              src={plinLogo}
              alt="Plin"
              className="payment-logo"
            />

            <img
              src={pagoQr}
              alt="Pago QR"
              className="payment-image"
            />

          </div>

        </label>

        <button
          className="continue-btn"
          onClick={handleContinue}
        >
          Continuar
        </button>

      </div>

    </main>

  )
}

export default Payment