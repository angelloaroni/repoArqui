// src/components/editVehicle/EditVehicle.jsx

import { useState } from 'react'

import {
  useNavigate,
  useParams
} from 'react-router-dom'

import vehicles from '../../data/vehicle'

import './EditVehicle.css'

function EditVehicle() {

  const navigate =
    useNavigate()

  const { vehicleId } =
    useParams()

  const vehicle =
    vehicles.find(
      vehicle =>
        vehicle.id_vehicle ===
        vehicleId
    )

  if (!vehicle) {

    return (

      <main className="edit-vehicle">

        <h2>
          Vehículo no encontrado
        </h2>

      </main>

    )
  }

  const [brand, setBrand] =
    useState(
      vehicle.brand
    )

  const [model, setModel] =
    useState(
      vehicle.model
    )

  const [year, setYear] =
    useState(
      vehicle.year
    )

  const [plate, setPlate] =
    useState(
      vehicle.plate
    )

  const [color, setColor] =
    useState(
      vehicle.color
    )

        const [transmission,
    setTransmission] =
    useState(
        vehicle.transmission
    )

    const [fuelType,
    setFuelType] =
    useState(
        vehicle.fuel_type
    )

    const [seats,
    setSeats] =
    useState(
        vehicle.seats
    )

  const [pricePerDay,
    setPricePerDay] =
    useState(
      vehicle.price_per_day
    )

  const [location,
    setLocation] =
    useState(
      vehicle.location
    )

  const [description,
    setDescription] =
    useState(
      vehicle.description
    )

  const handleSave = () => {

        if (
    !brand ||
    !model ||
    !year ||
    !plate ||
    !color ||
    !transmission ||
    !fuelType ||
    !seats ||
    !pricePerDay ||
    !location
    ){

      alert(
        'Completa todos los campos obligatorios'
      )

      return
    }

  console.log({

    id_vehicle:
      vehicleId,

    brand,

    model,

    year,

    plate,

    color,

    transmission,

    fuel_type:
      fuelType,

    seats,

    price_per_day:
      pricePerDay,

    location,

    description

  })

    alert(
      'Aquí irá la lógica de actualización cuando backend este implementado.'
    )

    navigate(
      '/arrendador/mis-vehiculos'
    )
  }

  return (

    <main className="edit-vehicle">

      <div className="edit-vehicle-card">

        <h1>
          Editar Vehículo
        </h1>

        <div className="form-grid">

          <input
            type="text"
            placeholder="Marca"
            value={brand}
            onChange={(e) =>
              setBrand(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Modelo"
            value={model}
            onChange={(e) =>
              setModel(
                e.target.value
              )
            }
          />

          <input
            type="number"
            placeholder="Año"
            value={year}
            onChange={(e) =>
              setYear(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Placa"
            value={plate}
            onChange={(e) =>
              setPlate(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Color"
            value={color}
            onChange={(e) =>
              setColor(
                e.target.value
              )
            }
          />

            <input
            type="text"
            placeholder="Transmisión"
            value={transmission}
            onChange={(e) =>
                setTransmission(
                e.target.value
                )
            }
            />

            <input
            type="text"
            placeholder="Combustible"
            value={fuelType}
            onChange={(e) =>
                setFuelType(
                e.target.value
                )
            }
            />

            <input
            type="number"
            placeholder="Asientos"
            value={seats}
            onChange={(e) =>
                setSeats(
                e.target.value
                )
            }
            />    


          <input
            type="number"
            placeholder="Precio por día"
            value={pricePerDay}
            onChange={(e) =>
              setPricePerDay(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Ubicación"
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
          />

        </div>

        <textarea
          placeholder="
          Descripción del vehículo
          "
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        <button
          className="save-btn"
          onClick={handleSave}
        >
          Guardar Cambios
        </button>

      </div>

    </main>

  )
}

export default EditVehicle