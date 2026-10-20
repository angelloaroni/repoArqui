import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        // Extrae el token del encabezado 'Authorization: Bearer TOKEN_AQUÍ'
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No se envió Token de autenticación."
            });
        }

        // 🛡️ Obligamos a usar ÚNICAMENTE la variable del .env sin planes de respaldo de texto plano
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Inyectamos los datos decodificados del usuario en la petición
        req.usuario = decoded;
        
        next(); 
    } catch(error) {
        // 💡 CONSEJO PRO: Imprime el error real en tu consola de VS Code para ver EXACTAMENTE por qué falla
        console.error("🔴 Error detallado en verificación de JWT:", error.message);

        return res.status(401).json({
            success: false,
            message: "Token Inválido o expirado."
        });
    }
}

export default authMiddleware;