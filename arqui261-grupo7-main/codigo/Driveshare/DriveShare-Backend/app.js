// app.js (Backend)
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';

// 🌟 Importa tu archivo de passport para que se cargue la estrategia de Google
// (Ajusta la ruta exacta según dónde guardes passport.js, por ejemplo: './src/config/passport.js')
import './src/config/passport.js'; 

import categoriaRoutes from './src/routes/CategoriaRoutes.js';
import usuarioRoutes from './src/routes/UsuarioRoutes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🌟 Inicializar Passport antes de declarar las rutas en Express
app.use(passport.initialize());

// Rutas de categorías
app.use('/categoria', categoriaRoutes);

// 🌟 LA CLAVE AQUÍ: Montamos el mismo enrutador bajo dos prefijos estratégicos
// 1. Prefijo '/api' para que las rutas de Google hagan match EXACTO con tu .env sin tocarlo
app.use('/api', usuarioRoutes); 
// Esto habilitará en la app de Express:
// -> http://localhost:3000/api/auth/google
// -> http://localhost:3000/api/auth/callback/google

// 2. Prefijo '/api/usuarios' para que tus llamadas de Login, Registro y PUT del perfil sigan intactas
app.use('/api/usuarios', usuarioRoutes);
// Esto mantendrá habilitado:
// -> http://localhost:3000/api/usuarios/login
// -> http://localhost:3000/api/usuarios/registrar
// -> http://localhost:3000/api/usuarios/ (para los Datos Legales del Onboarding)

app.get('/', (req, res) => {
    res.send('Hello World! Server running.');
});

export default app;