// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './assets/index.css'

/* === PROVIDERS CONTEXTUALES === */
import { UserProvider } from './context/UserContext'

/* === GUARDIAS DE SEGURIDAD === */
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import RoleRoute from './components/RoleRoute/RoleRoute'
import PublicRoute from './components/PublicRoute/PublicRoute'

/* === PÁGINAS PÚBLICAS === */
import HomePage from './views/HomePage'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import ForgotPasswordPage from './views/ForgotPasswordPage'
import ResetPasswordPage from './views/ResetPasswordPage'
import VehiclesPage from './views/VehiclesPage'
import VehicleDetailPage from './views/VehicleDetailPage'
import SearchVehiclesPage from './views/SearchVehiclesPage'
import OAuthSuccessPage from './views/OAuthSuccessPage'
import VerificationPage from './views/VerificationPage'

/* === PÁGINAS PROTEGIDAS === */
import OnboardingPage from './views/OnboardingPage'
import ProfilePage from './views/ProfilePage'
import EditProfilePage from './views/EditProfilePage'
import ChangePasswordPage from './views/ChangePasswordPage'
import ReservationPage from './views/ReservationPage'
import PaymentPage from './views/PaymentPage'
import CardPaymentPage from './views/CardPaymentPage'
import YapePaymentPage from './views/YapePaymentPage'
import PlinPaymentPage from './views/PlinPaymentPage'
import MyReservationsPage from './views/MyReservationsPage'
import OwnerReservationsPage from './views/OwnerReservationsPage'

/* === PÁGINAS DE ARRENDADOR === */
import MyVehiclesPage from './views/MyVehiclesPage'
import PublishVehiclePage from './views/PublishVehiclePage'
import EditVehiclePage from './views/EditVehiclePage'

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>

          {/* === 1. RUTAS PÚBLICAS === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/vehiculos" element={<VehiclesPage />} />
          <Route path="/vehiculos/buscar" element={<SearchVehiclesPage />} />
          <Route path="/vehiculos/busqueda/:search" element={<VehiclesPage />} />
          <Route path="/vehiculos/:vehicleId" element={<VehicleDetailPage />} />
          
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verificar-cuenta" element={<VerificationPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />

          {/* === 2. RUTAS GENERALES PROTEGIDAS === */}
          <Route path="/usuario/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/usuario/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/usuario/perfil/editar" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/usuario/perfil/cambiar-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

          {/* === 3. RUTAS EXCLUSIVAS DE ARRENDATARIO === */}
          <Route path="/vehiculos/:vehicleId/reservar" element={<RoleRoute allowedRole="arrendatario"><ReservationPage /></RoleRoute>} />
          <Route path="/usuario/mis-reservas" element={<RoleRoute allowedRole="arrendatario"><MyReservationsPage /></RoleRoute>} />
          <Route path="/usuario/pago" element={<RoleRoute allowedRole="arrendatario"><PaymentPage /></RoleRoute>} />
          <Route path="/usuario/pago/tarjeta" element={<RoleRoute allowedRole="arrendatario"><CardPaymentPage /></RoleRoute>} />
          <Route path="/usuario/pago/yape" element={<RoleRoute allowedRole="arrendatario"><YapePaymentPage /></RoleRoute>} />
          <Route path="/usuario/pago/plin" element={<RoleRoute allowedRole="arrendatario"><PlinPaymentPage /></RoleRoute>} />

          {/* === 4. RUTAS EXCLUSIVAS DE ARRENDADOR === */}
          <Route path="/arrendador/mis-vehiculos" element={<RoleRoute allowedRole="arrendador"><MyVehiclesPage /></RoleRoute>} />
          <Route path="/arrendador/reservas" element={<RoleRoute allowedRole="arrendador"><OwnerReservationsPage /></RoleRoute>} />
          <Route path="/arrendador/vehiculos/publicar" element={<RoleRoute allowedRole="arrendador"><PublishVehiclePage /></RoleRoute>} />
          <Route path="/arrendador/vehiculos/editar/:vehicleId" element={<RoleRoute allowedRole="arrendador"><EditVehiclePage /></RoleRoute>} />

        </Routes>
      </BrowserRouter>
    </UserProvider>
   </React.StrictMode>
)