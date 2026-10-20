import Usuario from "../models/Usuario.js";
import RepositoryBase from "./RepositoryBase.js";

class UsuarioRepository extends RepositoryBase {
    constructor() {
        super(Usuario); // Inicializa RepositoryBase pasándole el modelo USER adaptado
    }

    // 🔍 Buscar un usuario por su Email (Esencial para el Login Local y validaciones de Google)
    async findByEmail(email) {
        try {
            return await Usuario.findOne({
                where: { email: email }
            });
        } catch (error) {
            console.error("❌ Error en UsuarioRepository.findByEmail:", error.message);
            throw error;
        }
    }

    // 🔍 Buscar un usuario por su Google ID (Esencial para el Callback de Google OAuth)
    async findByGoogleId(googleId) {
        try {
            return await Usuario.findOne({
                where: { google_id: googleId }
            });
        } catch (error) {
            console.error("❌ Error en UsuarioRepository.findByGoogleId:", error.message);
            throw error;
        }
    }
}

// Instanciamos la clase extendida
const usuarioRepository = new UsuarioRepository();

export default usuarioRepository;