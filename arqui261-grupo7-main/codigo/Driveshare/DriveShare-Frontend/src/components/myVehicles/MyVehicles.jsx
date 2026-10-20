// src/components/myVehicles/MyVehicles.jsx

import './MyVehicles.css'
import vehicleImages from '../../data/vehicleImages'

import { useNavigate } from 'react-router-dom'

import getCurrentUser from '../../utils/getCurrentUser'

import vehicles from '../../data/vehicle'

function MyVehicles() {

  const navigate =
    useNavigate()

  const currentUser =
    getCurrentUser()

  const myVehicles =
    vehicles.filter(
      vehicle =>
        vehicle.owner_id ===
        currentUser?.id_user
    )

  const handleDeleteVehicle = (
    vehicleId
  ) => {

    const confirmed =
      window.confirm(
        '¿Deseas eliminar este vehículo?'
      )

    if (!confirmed) {
      return
    }

    console.log(
      'Eliminar vehículo:',
      vehicleId
    )

    alert(
      'Aquí irá la lógica de eliminación cuando exista backend.'
    )
  }

  return (

    <main className="my-vehicles">

      <h1>
        Mis Vehículos
      </h1>

      {
        myVehicles.length === 0 && (

          <p>
            Aún no has publicado
            vehículos.
          </p>

        )
      }

      <div className="vehicles-grid">

        {myVehicles.map(
          vehicle => (

            <div
              key={
                vehicle.id_vehicle
              }
              className="vehicle-card"
            >

              <div className="vehicle-image">
                <img
                  src={vehicleImages.find(img => img.vehicle_id === vehicle.id_vehicle)?.image_url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                />
              </div>

              <h3>
                {vehicle.brand}
                {' '}
                {vehicle.model}
              </h3>

              <p>
                {vehicle.location}
              </p>

              <p>
                Año:
                {' '}
                {vehicle.year}
              </p>

              <p>
                Placa:
                {' '}
                {vehicle.plate}
              </p>

              <p>
                S/
                {' '}
                {
                  vehicle.price_per_day
                }
                {' '}
                por día
              </p>

              <span
                className={
                  vehicle.is_available
                    ? 'available'
                    : 'unavailable'
                }
              >

                {
                  vehicle.is_available
                    ? 'Disponible'
                    : 'No Disponible'
                }

              </span>

              <div
                className="vehicle-actions"
              >

                <button
                  className="view-btn"
                  onClick={() =>
                    navigate(
                      `/vehiculos/${vehicle.id_vehicle}`
                    )
                  }
                >
                  Ver
                </button>

                <button
                  className="edit-btn"
                  onClick={() =>
                    navigate(
                      `/arrendador/vehiculos/editar/${vehicle.id_vehicle}`
                    )
                  }
                >
                  Editar
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDeleteVehicle(
                      vehicle.id_vehicle
                    )
                  }
                >
                  Eliminar
                </button>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  )
}

export default MyVehicles