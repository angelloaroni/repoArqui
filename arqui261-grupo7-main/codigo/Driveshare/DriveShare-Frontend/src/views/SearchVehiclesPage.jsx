// src/views/SearchVehiclesPage.jsx
// Compatibilidad: /vehiculos/buscar → catálogo unificado

import { Navigate } from 'react-router-dom'

function SearchVehiclesPage() {
  return <Navigate to="/vehiculos" replace />
}

export default SearchVehiclesPage
