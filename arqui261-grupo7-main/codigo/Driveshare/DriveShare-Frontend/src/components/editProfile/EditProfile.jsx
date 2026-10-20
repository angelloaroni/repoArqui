// src/components/editProfile/EditProfile.jsx
import './EditProfile.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

function EditProfile() {
  const navigate = useNavigate()
  
  // 🔌 CONEXIÓN: Extraemos 'usuario', 'user' y 'updateProfile' del contexto unificado
  const { usuario, user, updateProfile } = useUser()
  const datosUsuario = usuario || user

  // Estados basados estrictamente en el ERD expandido e inputs de tu diseño
  const [name, setName] = useState(datosUsuario?.name || datosUsuario?.nombre || '')
  const [lastname, setLastname] = useState(datosUsuario?.lastname || datosUsuario?.apellido || '')
  const [phone, setPhone] = useState(datosUsuario?.phone || datosUsuario?.telefono || '')
  const [avatarUrl, setAvatarUrl] = useState(
    datosUsuario?.avatar_url || datosUsuario?.avatar || datosUsuario?.imagen || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  )

  // Estados locales alineados para la validación y datos legales
  const [documentId, setDocumentId] = useState(datosUsuario?.document_id || datosUsuario?.dni || '')
  const [nationality, setNationality] = useState(datosUsuario?.nationality || 'Peruano')
  const [driverLicense, setDriverLicense] = useState(datosUsuario?.driver_license || '')
  const [birthDate, setBirthDate] = useState(datosUsuario?.birth_date || '')

  // Handler para guardar los cambios en la base de datos real
  const handleSave = async () => {
    if (!name.trim() || !lastname.trim()) {
      alert("El nombre y el apellido son obligatorios.")
      return
    }

    try {
      // 📦 Estructuramos el payload mapeando los campos al formato que espera Sequelize
      const payload = {
        nombre: name.trim(),
        apellido: lastname.trim(),
        telefono: phone.trim(),
        avatar: avatarUrl.trim(),
        dni: documentId.trim(),
        nationality: nationality,
        driver_license: driverLicense.trim(),
        birth_date: birthDate
      }

      // Enviamos la petición real al backend mediante la función del contexto
      const resultado = await updateProfile(payload)

      if (resultado && resultado.success) {
        alert("✨ ¡Perfil actualizado con éxito en DriveShare!")
        navigate('/usuario/perfil') // Redirige de vuelta a la vista del perfil
      } else {
        alert(resultado?.message || "Ocurrió un error al intentar actualizar el perfil.")
      }
    } catch (error) {
      console.error("❌ Error al guardar los cambios del perfil:", error)
      alert("Hubo un problema de conexión con el servidor. Inténtalo de nuevo.")
    }
  }

  return (
    <main className="edit-profile-section">
      <div className="edit-profile-card">
        <h1>Editar Perfil</h1>

        <div className="edit-profile-form">
          
          {/* Vista previa y campo del Avatar */}
          <div className="profile-image-container">
            <img 
              src={avatarUrl} 
              alt="Vista previa del avatar" 
              className="profile-avatar-preview" 
            />
          </div>

          <div className="input-group">
            <label>URL de la Imagen de Perfil</label>
            <input 
              type="text" 
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)} 
              placeholder="https://enlace-de-tu-imagen.com/foto.png" 
            />
          </div>

          {/* Fila Doble: Nombre y Apellido */}
          <div className="form-row">
            <div className="input-group">
              <label>Nombre</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Tu nombre" 
              />
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <input 
                type="text" 
                value={lastname} 
                onChange={(e) => setLastname(e.target.value)} 
                placeholder="Tu apellido" 
              />
            </div>
          </div>

          {/* Fila Doble: Teléfono y Documento de Identidad */}
          <div className="form-row">
            <div className="input-group">
              <label>Teléfono Celular</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="N° de teléfono" 
              />
            </div>
            <div className="input-group">
              <label>DNI / Documento de Identidad</label>
              <input 
                type="text" 
                value={documentId} 
                onChange={(e) => setDocumentId(e.target.value)} 
                placeholder="N° de documento" 
              />
            </div>
          </div>

          {/* Fila Doble: Nacionalidad y Licencia de Conducir */}
          <div className="form-row">
            <div className="input-group">
              <label>Nacionalidad</label>
              <select 
                value={nationality} 
                onChange={(e) => setNationality(e.target.value)}
                style={{
                  padding: '14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '15px',
                  backgroundColor: 'white',
                  outline: 'none',
                  width: '100%',
                  height: '49px'
                }}
              >
                <option value="Peruano">Peruano/a</option>
                <option value="Chileno">Chileno/a</option>
                <option value="Colombiano">Colombiano/a</option>
                <option value="Argentino">Argentino/a</option>
                <option value="Extranjero">Otra nacionalidad</option>
              </select>
            </div>
            <div className="input-group">
              <label>Licencia de Conducir</label>
              <input 
                type="text" 
                value={driverLicense} 
                onChange={(e) => setDriverLicense(e.target.value)} 
                placeholder="N° de Licencia" 
              />
            </div>
          </div>

          {/* Campo de Ancho Completo: Fecha de Nacimiento */}
          <div className="input-group">
            <label>Fecha de Nacimiento</label>
            <input 
              type="date" 
              value={birthDate} 
              onChange={(e) => setBirthDate(e.target.value)} 
            />
          </div>

          {/* Botonera de control inferior */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/usuario/perfil')}>
              Cancelar
            </button>
            <button type="button" className="btn-save" onClick={handleSave}>
              Guardar Cambios
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}

export default EditProfile