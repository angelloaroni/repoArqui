// src/components/publishVehicle/PublishVehicle.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './PublishVehicle.css'

function PublishVehicle() {

  const navigate =
    useNavigate()

  const initialForm = {

    brand: '',
    model: '',

    year: '',

    plate: '',

    color: '',

    transmission: '',

    fuel_type: '',

    seats: '',

    price_per_day: '',

    location: '',

    description: ''

  }

  const [formData, setFormData] =
    useState(initialForm)

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    })
  }

  const handleSubmit = (e) => {

    e.preventDefault()

    const requiredFields = [

      formData.brand,
      formData.model,

      formData.year,

      formData.plate,

      formData.transmission,

      formData.fuel_type,

      formData.seats,

      formData.price_per_day,

      formData.location

    ]

    const isValid =
      requiredFields.every(
        field =>
          field.toString().trim() !== ''
      )

    if (!isValid) {

      alert(
        'Completa todos los campos obligatorios.'
      )

      return
    }

    const vehicleData = {

      ...formData,

      brand:
        formData.brand.trim(),

      model:
        formData.model.trim(),

      plate:
        formData.plate.trim(),

      color:
        formData.color.trim(),

      transmission:
        formData.transmission.trim(),

      fuel_type:
        formData.fuel_type.trim(),

      location:
        formData.location.trim(),

      description:
        formData.description.trim()

    }

    console.log(
      vehicleData
    )

    alert(
      'Vehículo publicado correctamente'
    )

    setFormData(
      initialForm
    )

    navigate(
      '/arrendador/mis-vehiculos'
    )
  }

  return (

    <main className="publish-vehicle">

      <div className="publish-card">

        <h1>
          Publicar Vehículo
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
        >

          <input
            type="text"
            name="brand"
            placeholder="Marca"
            value={
              formData.brand
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="model"
            placeholder="Modelo"
            value={
              formData.model
            }
            onChange={
              handleChange
            }
          />

          <input
            type="number"
            name="year"
            placeholder="Año"
            value={
              formData.year
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="plate"
            placeholder="Placa"
            value={
              formData.plate
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="color"
            placeholder="Color"
            value={
              formData.color
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="transmission"
            placeholder="Transmisión"
            value={
              formData.transmission
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="fuel_type"
            placeholder="Combustible"
            value={
              formData.fuel_type
            }
            onChange={
              handleChange
            }
          />

          <input
            type="number"
            name="seats"
            placeholder="Asientos"
            value={
              formData.seats
            }
            onChange={
              handleChange
            }
          />

          <input
            type="number"
            name="price_per_day"
            placeholder="Precio por día"
            value={
              formData.price_per_day
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="location"
            placeholder="Ubicación"
            value={
              formData.location
            }
            onChange={
              handleChange
            }
          />

          <textarea
            name="description"
            placeholder="Descripción"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
          />

          <button
            type="submit"
          >
            Publicar Vehículo
          </button>

        </form>

      </div>

    </main>

  )
}

export default PublishVehicle