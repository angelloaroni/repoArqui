// src/components/Verification/Verification.jsx
import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Verification.css'; // Cargamos sus propios estilos unificados

export default function Verification() {
  const { verifyAccount } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    if (!email || !codigo) {
      setErrorMsg('Por favor, completa todos los campos.');
      setCargando(false);
      return;
    }

    try {
      const resultado = await verifyAccount(email, codigo);

      if (resultado && resultado.success) {
        navigate('/home');
      } else {
        setErrorMsg(resultado?.message || 'Código incorrecto o vencido.');
      }
    } catch (error) {
      console.error('❌ Error en formulario de activación:', error);
      setErrorMsg('Error de comunicación con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="verification-section">
      <div className="verification-card">
        
        <h1>Verifica tu Cuenta</h1>
        <p>
          Ingresa tu dirección de correo electrónico junto con el código de 6 dígitos que enviamos para activar tu perfil.
        </p>

        <form onSubmit={handleSubmit} className="verification-form">
          
          {/* Campo de Correo */}
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo de Código de Verificación */}
          <div className="input-group">
            <label htmlFor="codigo">Código de Seguridad (6 dígitos)</label>
            <input
              id="codigo"
              type="text"
              maxLength="6"
              placeholder="000000"
              className="input-code"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} // Solo permite números
              required
            />
          </div>

          {/* Manejo de Alertas de Error */}
          {errorMsg && (
            <div className="error-alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Botón de Envío */}
          <button 
            type="submit" 
            className="btn-verification" 
            disabled={cargando}
          >
            {cargando ? 'Validando...' : 'Activar mi Cuenta'}
          </button>

        </form>
      </div>
    </section>
  );
}