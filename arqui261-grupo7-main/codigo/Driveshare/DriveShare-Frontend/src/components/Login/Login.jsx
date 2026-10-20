// src/components/Login/Login.jsx
import './Login.css';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from '../../context/UserContext';

// Importación de assets del proyecto DriveShare
import driveShareLogo from '../../assets/logos/driveshare-logo.png';
import heroBackground from '../../assets/images/hero-background-city-night.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useUser(); 

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const [errorMsg, setErrorMsg] = useState(''); // Para pintar errores elegantes en la tarjeta

    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrorMsg('');

        if (!usuario || !password) {
            setErrorMsg("Por favor ingresa correo y contraseña");
            return;
        }

        setLoading(true);
        
        try {
            // 1. Llamamos a la función adaptada del contexto global
            const datosUsuario = await login(usuario, password);
            setLoading(false);

            // 2. Si recibimos un usuario válido, evaluamos a dónde enviarlo
            if (datosUsuario) {
                // Si la cuenta está pendiente de verificación con los 6 dígitos, lo enviamos directo
                if (datosUsuario.status === 'pending_verification') {
                    alert("Tu cuenta aún no está activa. Redirigiendo a verificación...");
                    navigate('/verificar-cuenta');
                    return;
                }

                alert(`¡Bienvenido de vuelta, ${datosUsuario.nombre || datosUsuario.name || 'Usuario'}!`);

                // Evaluamos su rol o privilegios para el ruteo inicial
                if (datosUsuario.admin === true || datosUsuario.role?.toLowerCase() === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    // 🔑 ADUANA COMPLETAMENTE BLINDADA CONTRA NOMBRES MULTIIDIOMA:
                    // Extraemos los valores usando fallbacks para asegurarnos de pescar el campo real
                    const dniExistente = datosUsuario.document_id || datosUsuario.dni;
                    const licenciaExistente = datosUsuario.driver_license || datosUsuario.licencia || datosUsuario.driverLicense;
                    const telefonoExistente = datosUsuario.phone || datosUsuario.telefono;

                    // El perfil se considera incompleto SÓLO si falta realmente alguno de los campos mandatorios
                    const tienePerfilIncompleto = !dniExistente || !licenciaExistente || !telefonoExistente;

                    console.log("📊 Validación de Onboarding en Login:", {
                        dniExistente,
                        licenciaExistente,
                        telefonoExistente,
                        tienePerfilIncompleto
                    });

                    if (tienePerfilIncompleto) {
                        navigate('/usuario/onboarding');
                    } else {
                        navigate('/home');
                    }
                }
            } else {
                setErrorMsg("Credenciales incorrectas o error en el servidor.");
            }
        } catch (error) {
            console.error("❌ Error en el manejador de Login:", error);
            setErrorMsg("Hubo un problema al conectar con el servidor.");
            setLoading(false);
        }
    };

    // Handler operativo para el login de Google OAuth2
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/api/auth/google';
    };

    return (
        <section className="login-section" style={{ backgroundImage: `url(${heroBackground})` }}>
            <div className="login-card">
                <div className="login-logo-container">
                    <img src={driveShareLogo} alt="DriveShare Logo" className="login-logo" />
                </div>
                
                <h1>Iniciar sesión</h1>
                <p>¡Qué bueno verte de nuevo! Ingresa tus credenciales para continuar.</p>

                {/* Mostrar alerta estética de error si existe */}
                {errorMsg && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
                        ⚠️ {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            placeholder="correo@ejemplo.com"
                            value={usuario} 
                            onChange={(e) => setUsuario(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Contraseña"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-login" 
                        disabled={loading} 
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Cargando..." : "Iniciar sesión"}
                    </button>

                    {/* Botón de Google conectado de forma estricta */}
                    <button type="button" className="btn-google" onClick={handleGoogleLogin}>
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/300/300221.png" 
                            alt="Google" 
                            className="google-icon"
                        />
                        Continuar con Google
                    </button>

                    <div className="login-links">
                        <Link to="/register">Registrarme</Link> 
                        <Link to="/forgot-password">Olvidé mi contraseña</Link>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;