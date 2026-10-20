// src/components/ResetPassword/ResetPassword.jsx
import '../ForgotPassword/ForgotPassword.css'; // Reutiliza los estilos base de la tarjeta oscura
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Si ForgotPassword nos pasa el email mediante el state de React Router, lo precarga automáticamente
  const [email, setEmail] = useState(location.state?.email || '');
  const [codigo, setCodigo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (codigo.length < 6) {
      setErrorMsg('El código de verificación debe ser de 6 dígitos.');
      return;
    }

    setLoading(true);

    try {
      // Conexión directa a tu endpoint de Node.js
      const respuesta = await axios.post('http://localhost:3000/api/reset-password', {
        email: email.trim(),
        codigo: codigo.trim(),
        newPassword: newPassword
      });

      setLoading(false);

      if (respuesta.data && respuesta.data.success) {
        setSuccessMsg('¡Contraseña restablecida con éxito! Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setLoading(false);
      console.error("❌ Error restableciendo clave:", error);
      setErrorMsg(error.response?.data?.message || 'Código incorrecto, expirado o error del servidor.');
    }
  };

  return (
    <section className="forgot-section">
      <div className="forgot-card">
        <h1>Nueva Contraseña</h1>
        <p>Ingresa el código que generó el servidor y define tu nueva contraseña para DriveShare.</p>

        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            🎉 {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Confirma tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || !!location.state?.email} // Bloqueado si ya viene del paso anterior
            required
          />

          <input
            type="text"
            placeholder="Código de verificación (6 dígitos)"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} // Bloquea letras por si acaso
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: '#22c55e', 
              color: 'white', 
              border: 'none', 
              padding: '14px', 
              borderRadius: '14px', 
              fontWeight: '700', 
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: '0.2s'
            }}
          >
            {loading ? 'Actualizando datos...' : 'Restablecer Contraseña ➔'}
          </button>
        </form>

        <div className="login-links" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
            Cancelar y Volver
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;