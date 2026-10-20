import 'dotenv/config'; // 💡 LÍNEA 1: Fuerza la carga del .env antes de cualquier otra cosa
import express from 'express';
import cors from 'cors';
import sequelize from './src/config/database.js';
import usuarioRoutes from './src/routes/UsuarioRoutes.js';
import reservationRoutes from './src/routes/ReservationRoutes.js';
import reviewRoutes from './src/routes/ReviewRoutes.js';

// Importamos Passport ABAJO para asegurarnos de que ya existan las variables de entorno de Google
import passport from 'passport'; 
import './src/config/passport.js'; 

const app = express();
app.use(cors());
app.use(express.json());

// Inicializamos passport en la aplicación de Express
app.use(passport.initialize());

// Vincular las rutas
app.use('/api', usuarioRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

console.log('🚗 Backend de DriveShare Iniciado con éxito');

// Sincronizar e inicializar
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('🟢 ¡Tablas de DriveShare mapeadas en Postgres con éxito!');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de DriveShare corriendo en el puerto ${PORT}.`);
    });
  })
  .catch(err => {
    console.error('🔴 Error crítico al sincronizar las tablas de la BD:', err.message);
  });
