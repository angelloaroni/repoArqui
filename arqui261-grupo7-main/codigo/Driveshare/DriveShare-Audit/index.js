import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import sequelize from './src/config/database.js';

import './src/models/AuditLog.js';
import auditRoutes from './src/routes/AuditRoutes.js';

const app = express();

app.use(cors());

app.use(express.json());

// Registrar las rutas del Sidecar
app.use(auditRoutes);

// Endpoint de prueba
app.get('/', (req, res) => {

    res.json({

        service: 'DriveShare Audit Sidecar',

        status: 'running'

    });

});

// Sincronizar BD e iniciar servidor
sequelize.sync({ alter: true })

.then(() => {

    console.log('🟢 AUDIT_LOG sincronizada correctamente.');

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {

        console.log('🚀 DriveShare Audit iniciado');

        console.log(`Servidor escuchando en puerto ${PORT}`);

    });

})

.catch(err => {

    console.error('❌ Error al sincronizar la BD:', err);

});