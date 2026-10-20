// src/components/ChangePassword/ChangePassword.jsx
import './ChangePassword.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext' 

function ChangePassword() {
  const navigate = useNavigate()
  
  // 🔌 CONEXIÓN: Extraemos la sesión y la función adaptada para el cambio de clave en la BD
  const { user, usuario, updatePassword } = useUser()
  const datosUsuario = user || usuario

  // Estado unificado para el formulario
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Estado para mostrar/ocultar contraseñas
  const [showPasswords, setShowPasswords] = useState(false)

  // Reglas de validación en tiempo real para la NUEVA contraseña
  const passwordRules = {
    length: passwords.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwords.newPassword),
    number: /[0-9]/.test(passwords.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword),
  }

  const isNewPasswordValid = Object.values(passwordRules).every(Boolean)
  const doPasswordsMatch = passwords.newPassword === passwords.confirmPassword

  // Validaciones lógicas del formulario completo
  const isFormValid =
    passwords.currentPassword.trim().length > 0 &&
    isNewPasswordValid &&
    doPasswordsMatch

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    })
  }

  // 🚀 Manejador del envío del formulario al backend de Express/PostgreSQL
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return

    try {
      const resultado = await updatePassword(passwords.currentPassword, passwords.newPassword); 
      
      if (resultado && resultado.success) {
        alert('✨ ¡Tu contraseña ha sido actualizada exitosamente en DriveShare!')
        navigate('/usuario/perfil') // Redirigimos de vuelta al perfil tras el éxito
      } else {
        alert(resultado?.message || 'La contraseña actual ingresada es incorrecta.')
      }
    } catch (error) {
      console.error('❌ Error al cambiar la contraseña en el cliente:', error)
      alert('Hubo un problema de comunicación con el servidor. Inténtalo de nuevo.')
    }
  }

  if (!datosUsuario) {
    return (
      <section className="change-password-section">
        <div className="change-password-card" style={{ textAlign: 'center' }}>
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '10px' }}>Por favor, inicia sesión para poder modificar tus credenciales de seguridad.</p>
          <button className="btn-cancel" style={{ marginTop: '15px' }} onClick={() => navigate('/login')}>
            Ir al Login
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="change-password-section">
      <div className="change-password-card">
        <h1>Cambiar Contraseña</h1>
        <p>Asegúrate de crear una combinación robusta para proteger tus datos de DriveShare.</p>

        <form onSubmit={handleSubmit}>
          
          {/* Input: Contraseña Actual */}
          <div className="input-group">
            <label>Contraseña Actual</label>
            <input
              type={showPasswords ? "text" : "password"}
              name="currentPassword"
              placeholder="Ingresa tu clave actual"
              value={passwords.currentPassword}
              onChange={handleChange}
              requiredres
            />
          </div>

          {/* Input: Nueva Contraseña */}
          <div className="input-group">
            <label>Nueva Contraseña</label>
            <input
              type={showPasswords ? "text" : "password"}
              name="newPassword"
              placeholder="Mínimo 8 caracteres"
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Input: Confirmar Nueva Contraseña */}
          <div className="input-group">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type={showPasswords ? "text" : "password"}
              name="confirmPassword"
              placeholder="Repite tu nueva clave"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Checkbox para mostrar/ocultar los campos */}
          <div className="show-password-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <input
              type="checkbox"
              id="toggle-passwords"
              checked={showPasswords}
              onChange={() => setShowPasswords(!showPasswords)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="toggle-passwords" style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
              Mostrar contraseñas
            </label>
          </div>

          {/* Lista Dinámica de Requerimientos de Seguridad */}
          <div className="password-requirements-box">
            <p>Tu contraseña nueva debe cumplir con:</p>
            <div className="password-requirements-grid">
              <span className="requirement-item" style={{ color: passwordRules.length ? '#16a34a' : '#94a3b8', fontWeight: passwordRules.length ? '600' : '400' }}>
                {passwordRules.length ? '✓' : '○'} Mín. 8 caracteres
              </span>
              <span className="requirement-item" style={{ color: passwordRules.upper ? '#16a34a' : '#94a3b8', fontWeight: passwordRules.upper ? '600' : '400' }}>
                {passwordRules.upper ? '✓' : '○'} Una mayúscula
              </span>
              <span className="requirement-item" style={{ color: passwordRules.number ? '#16a34a' : '#94a3b8', fontWeight: passwordRules.number ? '600' : '400' }}>
                {passwordRules.number ? '✓' : '○'} Un número
              </span>
              <span className="requirement-item" style={{ color: passwordRules.special ? '#16a34a' : '#94a3b8', fontWeight: passwordRules.special ? '600' : '400' }}>
                {passwordRules.special ? '✓' : '○'} Carácter especial
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <button
            type="submit"
            className="btn-change-password"
            disabled={!isFormValid}
          >
            Actualizar Contraseña ➔
          </button>

          <button
            type="button"
            className="btn-cancel-link"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              marginTop: '15px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => navigate('/usuario/perfil')}
          >
            Volver al perfil
          </button>
        </form>
      </div>
    </section>
  )
}

export default ChangePassword