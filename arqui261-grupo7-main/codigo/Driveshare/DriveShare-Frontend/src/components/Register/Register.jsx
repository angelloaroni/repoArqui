// src/components/Register/Register.jsx
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/logos/driveshare-logo.png';
import { useUser } from '../../context/UserContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useUser(); // Consumimos la función asíncrona real del contexto

  const [role, setRole] = useState('Arrendatario');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [cargando, setCargando] = useState(false); // Estado para deshabilitar clicks repetidos
  const [errorMsg, setErrorMsg] = useState('');    // Captura mensajes de error del backend

  // 📝 Estado simplificado: Se eliminaron DNI y Teléfono por estrategia de Onboarding
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
  });

  const passwordRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Validación actualizada sin DNI ni Teléfono
  const isFormValid =
    formData.name.trim() &&
    formData.lastname.trim() &&
    formData.email.trim() &&
    isPasswordValid &&
    acceptedTerms &&
    !cargando;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setCargando(true);
    setErrorMsg('');

    try {
      // 🌟 Enviamos los datos limpios y el rol real al contexto/API
      const datosRegistro = {
        nombre: formData.name.trim(),
        apellido: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: role.toLowerCase() // Envía correctamente 'arrendatario' o 'arrendador'
      };

      const resultado = await register(datosRegistro);

      if (resultado && resultado.success) {
        alert(resultado.message || "Registro exitoso. Revisa tu código de verificación.");
        navigate('/verificar-cuenta');
      } else {
        setErrorMsg(resultado?.message || "Ocurrió un error al procesar el registro.");
      }
    } catch (error) {
      console.error("❌ Error en el envío del formulario de registro:", error);
      setErrorMsg("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // 🌟 FUNCIÓN PARA REDIRIGIR AL FLUJO DE GOOGLE EN EL BACKEND
  const handleGoogleLogin = () => {
    // Redirección directa para que Passport tome el control del navegador de manera limpia
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="register-layout">
      {/* Lado Izquierdo (Imagen/Propuesta de valor) */}
      <div className="register-left">
        <div className="left-content">
          <h2>Conduce tus sueños, comparte el viaje.</h2>
          <p>Únete hoy a la comunidad de DriveShare y accede a cientos de vehículos confiables o empieza a monetizar el tuyo.</p>
        </div>
      </div>

      {/* Lado Derecho (Formulario de Registro) */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-header">
            <img src={logo} alt="DriveShare Logo" className="brand-logo" />
            <h1>Crea tu cuenta</h1>
            <p className="subtitle">Comienza a moverte con total libertad legal y seguridad.</p>
          </div>

          {/* Selector de Rol */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === 'Arrendatario' ? 'active' : ''}`}
              onClick={() => setRole('Arrendatario')}
            >
              Quiero Alquilar
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'Arrendador' ? 'active' : ''}`}
              onClick={() => setRole('Arrendador')}
            >
              Quiero Poner mi Auto
            </button>
          </div>

          <div className={`role-description ${role === 'Arrendatario' ? 'arrendatario' : 'arrendador'}`}>
            {role === 'Arrendatario' ? (
              <p>Como <strong>Arrendatario</strong>, podrás buscar, reservar y conducir vehículos de propietarios verificados in minutos.</p>
            ) : (
              <p>Como <strong>Arrendador</strong>, tendrás las herramientas para publicar tus autos, gestionar reservas y maximizar tus ingresos mensuales.</p>
            )}
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '10px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-row">
              <div className="input-group">
                <label>Nombre</label>
                <input type="text" name="name" placeholder="Juan" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Apellido</label>
                <input type="text" name="lastname" placeholder="Pérez" value={formData.lastname} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Correo Electrónico</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <div className="password-header">
                <label>Contraseña</label>
                <button 
                  type="button" 
                  className={`toggle-password ${showPassword ? 'on' : 'off'}`} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
              <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              <div className="password-checklist">
                <span className={passwordRules.length ? 'valid' : ''}>{passwordRules.length ? '✓' : '○'} Mín. 8 caracteres</span>
                <span className={passwordRules.upper ? 'valid' : ''}>{passwordRules.upper ? '✓' : '○'} Una mayúscula</span>
                <span className={passwordRules.number ? 'valid' : ''}>{passwordRules.number ? '✓' : '○'} Un número</span>
                <span className={passwordRules.special ? 'valid' : ''}>{passwordRules.special ? '✓' : '○'} Carácter especial</span>
              </div>
            </div>

            <div className="terms-group">
              <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
              <label htmlFor="terms">Acepto los Términos de Servicio y Privacidad.</label>
            </div>

            <button type="submit" className="btn-register" disabled={!isFormValid}>
              {cargando ? 'Procesando registro...' : 'Registrarse'}
            </button>

            {/* 🌟 LA PIEZA FALTANTE: LÍNEA DIVISORIA Y BOTÓN DE GOOGLE OAUTH */}
            <div className="oauth-divider" style={{ display: 'flex', alignItems: 'center', textTransform: 'uppercase', fontSize: '12px', color: '#888', margin: '20px 0' }}>
              <span style={{ flex: 1, borderBottom: '1px solid #e0e0e0' }}></span>
              <span style={{ padding: '0 10px' }}>O bien</span>
              <span style={{ flex: 1, borderBottom: '1px solid #e0e0e0' }}></span>
            </div>

            <button 
              type="button" 
              className="btn-google-oauth" 
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                border: '1px solid #dadce0',
                borderRadius: '10px',
                color: '#3c4043',
                fontSize: '15px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {/* Icono de Google limpio en SVG */}
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.91c1.68-1.55 2.68-3.83 2.68-6.57z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.34 0-4.33-1.57-5.03-3.68H.95v2.3A8.99 8.99 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.97 10.77c-.18-.54-.28-1.11-.28-1.7 0-.59.1-1.16.28-1.7V5.07H.95A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.95 4.07l3.02-2.3z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3A8.99 8.99 0 0 0 .95 5.07l3.02 2.3c.7-2.11 2.69-3.68 5.03-3.68z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
          </form>

          <div className="register-links">
            <Link to="/login">¿Ya tienes una cuenta? Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;