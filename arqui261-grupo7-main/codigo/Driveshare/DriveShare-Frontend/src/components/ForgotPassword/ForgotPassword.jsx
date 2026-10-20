// src/components/ForgotPassword/ForgotPassword.jsx
import './ForgotPassword.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; 

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  
  const navigate = useNavigate();
  const { recoverPassword } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor, ingresa un correo electrónico.');
      return;
    }

    setLoading(true);
    
    try {
      const resultado = await recoverPassword(email.trim());
      setLoading(false);

      if (resultado && resultado.success) {
        setSent(true);
      } else {
        setErrorMsg(resultado?.message || 'El correo ingresado no se encuentra registrado.');
      }
    } catch (error) {
      console.error("❌ Error en el formulario de recuperación:", error);
      setErrorMsg('No se pudo conectar con el servidor. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  // 🌟 PANTALLA ACTUALIZADA: Avisa del código y agrega botón de redirección
  if (sent) {
    return (
      <section className="forgot-section">
        <div className="forgot-card">
          <h1 style={{ color: '#22c55e' }}>¡Código Generado!</h1>
          <p style={{ lineHeight: '1.6', marginVertical: '15px' }}>
            Hemos generado un código de verificación para <strong>{email}</strong>. 
            Por favor, revisa la consola de tu Backend para copiar los 6 dígitos.
          </p>
          
          <button
            onClick={() => navigate('/reset-password', { state: { email } })}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              marginTop: '15px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}
          >
            Ingresar Código y Cambiar Clave ➔
          </button>

          <div className="login-links" style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
            <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="forgot-section">
      <div className="forgot-card">
        <h1>Recuperar Contraseña</h1>
        <p>Ingresa tu correo electrónico registrado para restablecer tu cuenta de DriveShare.</p>
        
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="usuario@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <button 
            type="submit" 
            className="btn-login" 
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
            {loading ? 'Verificando correo...' : 'Enviar Instrucciones ➔'}
          </button>
        </form>

        <div className="login-links" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
            ¿Recordaste tu contraseña? Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;