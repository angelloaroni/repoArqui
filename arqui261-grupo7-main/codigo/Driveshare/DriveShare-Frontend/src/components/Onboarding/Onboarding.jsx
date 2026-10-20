// src/components/Onboarding/Onboarding.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; 
import logo from '../../assets/logos/driveshare-logo.png';
import './Onboarding.css'; // 🌟 Respetando tus estilos nativos

function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  
  const [ageError, setAgeError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // 📝 Sincronización exacta con las propiedades del Token JWT de tu Backend
  const [formData, setFormData] = useState({
    dni: user?.document_id || user?.dni || '',
    nationality: user?.nationality || 'Peruano',
    driver_license: user?.driver_license || '',
    license_expiration: user?.license_expiration || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || 'Masculino',
    telefono: user?.phone || user?.telefono || '' 
  });

  useEffect(() => {
    if (!formData.birth_date) {
      setAgeError('');
      return;
    }
    const dobDate = new Date(formData.birth_date);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setAgeError('Debes ser mayor de 18 años para poder conducir o rentar un vehículo legalmente.');
    } else {
      setAgeError('');
    }
  }, [formData.birth_date]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validación robusta que activa el botón solo cuando el usuario llene TODO el formulario
  const isFormValid =
    formData.dni.trim().length >= 8 &&
    formData.driver_license.trim().length >= 5 &&
    formData.license_expiration !== '' &&
    formData.birth_date !== '' &&
    formData.telefono.trim().length >= 7 &&
    !ageError &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const datosLegales = {
        document_id: formData.dni.trim(),          
        nationality: formData.nationality,
        driver_license: formData.driver_license.trim(),
        license_expiration: formData.license_expiration,
        birth_date: formData.birth_date,
        gender: formData.gender,
        phone: formData.telefono.trim()              
      };

      const resultado = await updateProfile(datosLegales);

      if (resultado && resultado.success) {
        alert("¡Datos legales verificados e inscritos con éxito!");
        
        // 🌟 REEMPLAZO CRÍTICO: En lugar de usar navigate(), forzamos una recarga limpia.
        // Esto limpia estados residuales en la memoria RAM y obliga a ProtectedRoute a leer el localStorage fresco.
        window.location.replace('/home');
      } else {
        setServerError(resultado?.message || "Ocurrió un error al guardar los datos de verificación.");
      }
    } catch (error) {
      console.error("❌ Error al enviar el onboarding legal:", error);
      setServerError("Hubo un problema de conexión con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="onboarding-container">
      <div className="onboarding-left">
        <div className="left-content">
          <h2>Tu seguridad es nuestra prioridad número uno.</h2>
          <p>
            En DriveShare validamos la identidad de cada conductor y propietario para mantener un ecosistema de alquiler transparente, confiable y 100% respaldado legalmente.
          </p>
        </div>
      </div>

      <div className="onboarding-right">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <img src={logo} alt="DriveShare Logo" className="onboarding-brand-logo" />
            <h1>Paso final: Datos Legales</h1>
            <p className="onboarding-subtitle">Por favor, completa tus datos obligatorios para habilitar la renta y publicación de vehículos.</p>
          </div>

          {serverError && (
            <div className="onboarding-error-box">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="onboarding-row">
              <div className="onboarding-group">
                <label>Número de DNI / CE</label>
                <input type="text" name="dni" placeholder="Ingresa tu documento" maxLength="12" value={formData.dni} onChange={handleChange} required />
              </div>
              <div className="onboarding-group">
                <label>Teléfono de Contacto</label>
                <input type="text" name="telefono" placeholder="+51 987654321" value={formData.telefono} onChange={handleChange} required />
              </div>
            </div>

            <div className="onboarding-row">
              <div className="onboarding-group">
                <label>Nro Licencia de Conducir</label>
                <input type="text" name="driver_license" placeholder="Q12345678" maxLength="20" value={formData.driver_license} onChange={handleChange} required />
              </div>
              <div className="onboarding-group">
                <label>Vencimiento de Licencia</label>
                <input type="date" name="license_expiration" value={formData.license_expiration} onChange={handleChange} required />
              </div>
            </div>

            <div className="onboarding-row">
              <div className="onboarding-group">
                <label>Género</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="onboarding-select">
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro / Prefiero no decirlo</option>
                </select>
              </div>
            </div>

            <div className="onboarding-row">
              <div className="onboarding-group">
                <label>Nacionalidad</label>
                <select name="nationality" value={formData.nationality} onChange={handleChange} className="onboarding-select">
                  <option value="Peruano">Peruano/a</option>
                  <option value="Chileno">Chileno/a</option>
                  <option value="Colombiano">Colombiano/a</option>
                  <option value="Argentino">Argentino/a</option>
                  <option value="Extranjero">Otra nacionalidad</option>
                </select>
              </div>
              <div className="onboarding-group">
                <label>Fecha de nacimiento</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
              </div>
            </div>

            {ageError && <span className="onboarding-error-text">{ageError}</span>}

            <div className="onboarding-info-box">
              💡 Al hacer clic en completar, declaras bajo juramento que los documentos ingresados se encuentran vigentes y te pertenecen.
            </div>

            <button type="submit" className="onboarding-btn-submit" disabled={!isFormValid}>
              {isSubmitting ? 'Guardando credenciales...' : 'Completar y Activar Cuenta ➔'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Onboarding;